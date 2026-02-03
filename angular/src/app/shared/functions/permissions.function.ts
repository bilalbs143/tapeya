export function verifyPermission(_permission: string, permissions: Array<string>): boolean {
  if (!_permission) {
    return true;
  }

  if (_permission.includes('&')) {
    const checkPermissions = _permission.split('&').map((e) => e.trim());

    return checkPermissions.every((permission) => permissions.includes(permission));
  }

  if (_permission.includes('|')) {
    const checkPermissions = _permission.split('|').map((e) => e.trim());

    return checkPermissions.some((permission) => permissions.includes(permission));
  }

  return permissions.includes(_permission);
}
