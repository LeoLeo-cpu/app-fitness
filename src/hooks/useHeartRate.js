import { useState, useCallback } from 'react';

export function useHeartRate() {
  const [heartRate, setHeartRate] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [device, setDevice] = useState(null);

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      setError("Web Bluetooth API não é suportada neste navegador.");
      return;
    }

    setIsConnecting(true);
    setError(null);
    
    try {
      const bluetoothDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }]
      });
      
      const server = await bluetoothDevice.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');
      
      await characteristic.startNotifications();
      
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        const rate16Bits = flags & 0x1;
        
        let hr;
        if (rate16Bits) {
          hr = value.getUint16(1, true);
        } else {
          hr = value.getUint8(1);
        }
        
        setHeartRate(hr);
      });

      bluetoothDevice.addEventListener('gattserverdisconnected', () => {
        setDevice(null);
        setHeartRate(null);
      });

      setDevice(bluetoothDevice);
    } catch (err) {
      console.error("Bluetooth Error: ", err);
      setError(err.message || "Falha ao conectar.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (device && device.gatt.connected) {
      device.gatt.disconnect();
    }
  }, [device]);

  return { heartRate, isConnecting, error, connect, disconnect, isConnected: !!device };
}
