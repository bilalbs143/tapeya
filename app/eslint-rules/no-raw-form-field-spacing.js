/** @typedef {import('eslint').Rule.RuleModule} RuleModule */

/** Tailwind utilities used for vertical field stacks — belong on FormStack, not <form>. */
const FIELD_STACK_PATTERN = /\b(?:space-y-\d+|gap-y-\d+|gap-\d+)\b/;

/**
 * @param {import('estree').Node | null | undefined} node
 * @returns {string[]}
 */
function extractClassNameStrings(node) {
  if (!node) return [];

  if (node.type === 'Literal' && typeof node.value === 'string') {
    return [node.value];
  }

  if (node.type === 'TemplateLiteral') {
    return node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw);
  }

  if (node.type === 'CallExpression') {
    return node.arguments.flatMap((arg) => extractClassNameStrings(arg));
  }

  if (node.type === 'ConditionalExpression') {
    return [...extractClassNameStrings(node.consequent), ...extractClassNameStrings(node.alternate)];
  }

  if (node.type === 'LogicalExpression') {
    return [...extractClassNameStrings(node.left), ...extractClassNameStrings(node.right)];
  }

  return [];
}

/** @type {RuleModule} */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow raw Tailwind field-stack spacing on <form>; use FormStack instead.',
    },
    messages: {
      noRawFormSpacing:
        'Avoid `{{token}}` on <form>. Wrap fields in <FormStack as="form"> from @/ui/form/FormStack instead (see docs/FORM_LAYOUT_STANDARDS.md).',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'form') return;

        const classAttr = node.attributes.find(
          (attr) => attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier' && attr.name.name === 'className',
        );
        if (!classAttr?.value) return;

        const valueNode = classAttr.value.type === 'JSXExpressionContainer' ? classAttr.value.expression : classAttr.value;

        for (const fragment of extractClassNameStrings(valueNode)) {
          const match = fragment.match(FIELD_STACK_PATTERN);
          if (match) {
            context.report({
              node: classAttr,
              messageId: 'noRawFormSpacing',
              data: { token: match[0] },
            });
            return;
          }
        }
      },
    };
  },
};

export default rule;
