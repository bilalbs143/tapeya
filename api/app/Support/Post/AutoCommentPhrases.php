<?php

namespace App\Support\Post;

/**
 * Combinatorial generic comment bodies (no @mentions, no clip-specific cricket terms).
 *
 * Mixes a few complete chat lines with short blessing/praise/origin layers so
 * comments read like a person typed them, not a stacked template.
 */
class AutoCommentPhrases
{
    /** @var list<string> */
    private const BLESSINGS = [
        'MashAllah',
        'Ma sha Allah',
        'Masha Allah',
        'Alhamdulillah',
        'Allah bless you',
        'Allah rakhe',
        'Allah khush rakhe',
        'Rab barkat de',
        'Boht khoob',
        'Kya baat hai',
        'Zabardast',
        'Shabash',
        'Wah wah',
        'Kamal hai',
        'Lajawab',
        'Fadu',
        'Mashallah jee',
    ];

    /** @var list<string> */
    private const PRAISE = [
        'Keep it up',
        'Keep going',
        'Hero',
        'Too good',
        'Nice one',
        'Good one',
        'Well done',
        'Respect',
        'Love this',
        'Bohat acha',
        'Bohat umda',
        'Mast hai',
        'Sahi hai',
        'Acha laga',
        'Mazaa agaya',
        'Jeetay raho',
        'Full support',
        'Always support',
        'Proud of you',
        'Super',
        'Very nice',
        'Top class',
        'Dil se',
    ];

    /** @var list<string> */
    private const ADDRESS = [
        'bro',
        'bhai',
        'bhai jan',
        'yaar',
        'janab',
        'jee',
    ];

    /** Complete where-from / add-you lines — used as a whole comment. */
    /** @var list<string> */
    private const ORIGIN = [
        'we will add you from?',
        'bhai we will add you from?',
        'add you from?',
        'add kahan se?',
        'kahan se add karein?',
        'hum kahan se add karein?',
        'ap ko kahan se add karein?',
        'bhai add kahan se karna hai?',
        'bhai ap kahan sy hain?',
        'ap kahan se ho?',
        'ap kahan se hain?',
        'ap kahan k ho?',
        'kis city se ho?',
        'konsi city?',
        'ap ka city konsa hai?',
        'kis shehar se ho?',
        'ap kis ilaqe se ho?',
        'kahan ke ho bhai?',
        'bhai kahan ke?',
        'kahan se ho yaar?',
        'bhai kidhar se?',
        'bhai ap kidhar se ho?',
        'ap kahan rehte ho?',
        'kahan wale ho?',
        'ap kahan wale?',
        'kidhar ke ho janab?',
        'where you from?',
        'where you from bro?',
        'from which city?',
        'which city bhai?',
        'city batao?',
        'ilaqa batao bhai?',
    ];

    /** Short support lines — not follow-bait. */
    /** @var list<string> */
    private const CHAT = [
        'stay blessed',
        'take care',
        'always with you',
        'keep it coming',
        'waiting for more',
        'keep posting',
        'ruko nahi',
        'carry on',
        'big fan',
        'true support',
        'Allah aap ko salamat rakhe',
    ];

    /** Ready-typed comments people actually leave. */
    /** @var list<string> */
    private const READY = [
        'MashAllah keep it up',
        'Ma sha Allah bhai',
        'Mashallah ❤️',
        'Zabardast yaar',
        'Kya baat hai bhai',
        'Keep it up bro',
        'Keep it up bhai',
        'Bohat khoob 🔥',
        'Allah rakhe bhai',
        'Love this ❤️',
        'Sahi hai bhai',
        'Acha laga',
        'MashAllah jee 👏',
        'Full support bhai',
        'Jeetay raho',
        'bhai ap kahan sy hain?',
        'we will add you from?',
        'ap kahan se ho?',
        'kis city se ho bhai?',
        'add kahan se karein?',
        'Alhamdulillah 🤍',
        'Too good bro',
        'Nice one yaar',
        'Wah bhai wah',
        'Kamal hai 🔥',
        'stay blessed bro',
        'always support ❤️',
        'Ma sha Allah keep going',
        'bhai mashallah',
        'hero 🔥',
    ];

    /** @var list<string> */
    private const EMOJI = [
        '❤️',
        '✌️',
        '🔥',
        '👏',
        '💪',
        '🙌',
        '💯',
        '✨',
        '😍',
        '🤍',
        '😊',
        '🙏',
    ];

    public static function random(): string
    {
        $roll = random_int(1, 100);

        $body = match (true) {
            $roll <= 22 => self::pick(self::READY),
            $roll <= 38 => self::originLine(),
            $roll <= 52 => self::withOptionalEmoji(self::withOptionalAddress(self::pick(self::BLESSINGS))),
            $roll <= 66 => self::withOptionalEmoji(self::withOptionalAddress(self::pick(self::PRAISE))),
            $roll <= 80 => self::withOptionalEmoji(self::join(
                self::pick(self::BLESSINGS),
                self::pick(self::PRAISE),
                self::maybeAddress(),
            )),
            $roll <= 88 => self::withOptionalEmoji(self::pick(self::CHAT)),
            $roll <= 94 => self::pick(self::EMOJI),
            default => self::withOptionalEmoji(self::pick(self::BLESSINGS)),
        };

        return mb_substr(self::vary($body), 0, 500);
    }

    /**
     * Pick a body that is not already used on this post (case, spacing, trailing punctuation ignored).
     *
     * @param  list<string>|iterable<int, string>  $existingBodies
     */
    public static function randomUnused(iterable $existingBodies): ?string
    {
        $used = [];
        foreach ($existingBodies as $body) {
            $key = self::normalize((string) $body);
            if ($key !== '') {
                $used[$key] = true;
            }
        }

        for ($i = 0; $i < 40; $i++) {
            $candidate = self::random();
            $key = self::normalize($candidate);
            if ($key !== '' && ! isset($used[$key])) {
                return $candidate;
            }
        }

        return null;
    }

    public static function normalize(string $body): string
    {
        $body = mb_strtolower(trim(preg_replace('/\s+/u', ' ', $body) ?? $body));

        return rtrim($body, " \t.!?");
    }

    private static function originLine(): string
    {
        return self::withOptionalEmoji(self::pick(self::ORIGIN));
    }

    private static function withOptionalAddress(string $line): string
    {
        if (self::alreadyAddresses($line) || random_int(1, 3) === 1) {
            return $line;
        }

        return random_int(0, 1) === 1
            ? self::join(self::pick(self::ADDRESS), $line)
            : self::join($line, self::pick(self::ADDRESS));
    }

    private static function withOptionalEmoji(string $line): string
    {
        if (random_int(1, 5) !== 1) {
            return $line;
        }

        return self::join($line, self::pick(self::EMOJI));
    }

    private static function maybeAddress(): string
    {
        return random_int(1, 2) === 1 ? '' : self::pick(self::ADDRESS);
    }

    private static function alreadyAddresses(string $line): bool
    {
        return (bool) preg_match('/\b(bro+|bhai|yaar|janab|jee|ap)\b/iu', $line);
    }

    /**
     * @param  list<string>  $pool
     */
    private static function pick(array $pool): string
    {
        return $pool[array_rand($pool)];
    }

    private static function join(string ...$parts): string
    {
        $tokens = [];
        foreach ($parts as $part) {
            $part = trim($part);
            if ($part === '') {
                continue;
            }
            foreach (preg_split('/\s+/u', $part) ?: [] as $token) {
                $prev = $tokens[array_key_last($tokens)] ?? null;
                if ($prev !== null && mb_strtolower($prev) === mb_strtolower($token)) {
                    continue;
                }
                $tokens[] = $token;
            }
        }

        return implode(' ', $tokens);
    }

    private static function vary(string $body): string
    {
        $body = trim(preg_replace('/\s+/u', ' ', $body) ?? $body);

        if (preg_match('/\p{L}/u', $body) !== 1) {
            if (random_int(0, 2) === 1) {
                $body = self::join($body, self::pick(self::EMOJI));
            }

            return $body;
        }

        if (random_int(1, 12) === 1 && preg_match('/\bbro$/i', $body) === 1) {
            $body .= 'o';
        }

        if (random_int(1, 12) === 1) {
            $body = mb_strtolower($body);
        }

        if (str_contains($body, '?')) {
            return $body;
        }

        if (random_int(1, 8) !== 1) {
            return $body;
        }

        return $body.(random_int(0, 3) === 0 ? '!!' : '!');
    }
}
