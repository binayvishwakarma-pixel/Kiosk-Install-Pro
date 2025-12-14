import { Store } from './types';

export const MOCK_DISTRICTS = ['North District', 'South District', 'East District', 'West District'];

export const MOCK_STORES: Store[] = [
  { id: '1', district: 'North District', storeNumber: '101', storeName: 'Grand Central Kiosk', address: '123 Main St, New York, NY' },
  { id: '2', district: 'North District', storeNumber: '102', storeName: 'Uptown Mall Kiosk', address: '456 Broadway, New York, NY' },
  { id: '3', district: 'South District', storeNumber: '201', storeName: 'Downtown Plaza', address: '789 Market St, San Francisco, CA' },
  { id: '4', district: 'East District', storeNumber: '301', storeName: 'Harbor Point', address: '101 Ocean Dr, Miami, FL' },
  { id: '5', district: 'West District', storeNumber: '401', storeName: 'Sunset Blvd Hub', address: '555 Sunset Blvd, Los Angeles, CA' },
];

export const REQUIRED_COUNTS = {
  BEFORE: 6,
  AFTER: 9,
  RECEIVING: 2,
};