const dns = require('node:dns');
const { configureMongoDnsResolvers } = require('../config/database');

describe('MongoDB DNS resolver configuration', () => {
  const originalServers = dns.getServers();
  const originalSetting = process.env.MONGODB_DNS_SERVERS;

  afterEach(() => {
    dns.setServers(originalServers);
    if (originalSetting === undefined) delete process.env.MONGODB_DNS_SERVERS;
    else process.env.MONGODB_DNS_SERVERS = originalSetting;
  });

  test('leaves the platform resolver unchanged when no override is configured', () => {
    delete process.env.MONGODB_DNS_SERVERS;
    expect(configureMongoDnsResolvers()).toBe(false);
    expect(dns.getServers()).toEqual(originalServers);
  });

  test('sets a comma-separated resolver list when configured', () => {
    expect(configureMongoDnsResolvers('8.8.8.8, 8.8.4.4')).toBe(true);
    expect(dns.getServers()).toEqual(['8.8.8.8', '8.8.4.4']);
  });

  test('rejects empty entries rather than silently applying a partial resolver list', () => {
    expect(() => configureMongoDnsResolvers('8.8.8.8,')).toThrow('comma-separated list');
  });
});
