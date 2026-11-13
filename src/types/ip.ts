export interface IPLocationData {
  ip: string;
  type: 'IPv4' | 'IPv6' | 'UNKNOWN';
  isLookup: boolean;
  city: string;
  region: string;
  regionCode?: string;
  country: string;
  countryCode: string;
  continent?: string;
  postal: string;
  latitude: number;
  longitude: number;
  isp: string;
  org: string;
  asn: string | number;
  domain?: string;
  capital?: string;
  callingCode?: string;
  flag?: {
    img?: string;
    emoji?: string;
  };
  timezone: {
    id: string;
    abbr?: string;
    offset?: number;
    utc?: string;
  };
  security: {
    isBogon: boolean;
    isVpnOrProxy: boolean;
    isTor: boolean;
    isDatacenter: boolean;
    threatScore: number; // 0 - 100
    threatLevel: 'MINIMAL' | 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';
    connectionType: 'Residential' | 'Datacenter' | 'Cellular' | 'Business' | 'Reserved' | 'Unknown';
    riskFactors: string[];
  };
  diagnostics: {
    latencyMs: number | null;
    fetchedAt: string;
    source: string;
  };
}

export interface SearchHistoryItem {
  ip: string;
  query: string;
  city: string;
  country: string;
  timestamp: number;
}

export type MapStyleId = 'phosphor' | 'amber' | 'mono' | 'raw';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ClientEnvironment {
  userAgent: string;
  browser: string;
  os: string;
  screenRes: string;
  language: string;
  dnt: boolean;
  online: boolean;
  cookieEnabled: boolean;
  timeZone: string;
}

export interface WebRTCLeakResult {
  tested: boolean;
  hasLeak: boolean;
  localIPs: string[];
  publicIPs: string[];
  statusText: string;
  recommendation: string;
}

export interface DNSRecord {
  name: string;
  type: string;
  typeCode: number;
  TTL: number;
  data: string;
}

export interface GlobalPingNode {
  id: string;
  region: string;
  location: string;
  flag: string;
  endpoint: string;
  latencyMs: number | null;
  status: 'pending' | 'testing' | 'optimal' | 'moderate' | 'slow' | 'error';
}

export interface SubnetResult {
  ip: string;
  cidr: number;
  netmask: string;
  wildcard: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIP: string;
  lastUsableIP: string;
  totalHosts: number;
  usableHosts: number;
  ipClass: string;
  isPrivate: boolean;
}
