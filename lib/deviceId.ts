export const getDeviceId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let deviceId = localStorage.getItem('doseCertoDeviceId');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('doseCertoDeviceId', deviceId);
  }
  return deviceId;
};
