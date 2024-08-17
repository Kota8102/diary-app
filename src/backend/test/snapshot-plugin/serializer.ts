export const serializer = {
  test: (val: unknown) => typeof val === 'string',
  serialize: (val: string) => {
    return `"${val
      // Asset hash をダミー値に置き換え
      .replace(/([A-Fa-f0-9]{64}.zip)/, 'HASH_REPLACED.zip')
      // Construct address をダミー値に置き換え
      .replace(/[a-f0-9]{42}/, '[CONSTRUCT_ADDR_REPLACED]')}"`;
  },
};