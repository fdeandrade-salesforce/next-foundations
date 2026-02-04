/**
 * Mock Store Data
 * 
 * This file contains all store/location data used in the application.
 * In production, this would be fetched from Supabase.
 */

import { Store } from '../../types'

export const mockStores: Store[] = [
  {
    id: 'store-1',
    name: 'Salesforce Foundations - San Francisco',
    address: '415 Mission Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'USA',
    phone: '+1 (415) 555-0100',
    hours: 'Open today: 10:00 AM - 8:00 PM',
    latitude: 37.7879,
    longitude: -122.3962,
    isOpen: true,
    pickupTime: 'Ready in 2 hours',
    distance: 0.5,
  },
  {
    id: 'store-2',
    name: 'Salesforce Foundations - New York',
    address: '123 Broadway',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    phone: '+1 (212) 555-0200',
    hours: 'Open today: 10:00 AM - 9:00 PM',
    latitude: 40.7128,
    longitude: -74.0060,
    isOpen: true,
    pickupTime: 'Ready in 2 hours',
    distance: 2500,
  },
  {
    id: 'store-3',
    name: 'Salesforce Foundations - Los Angeles',
    address: '456 Sunset Boulevard',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90028',
    country: 'USA',
    phone: '+1 (323) 555-0300',
    hours: 'Open today: 10:00 AM - 8:00 PM',
    latitude: 34.0522,
    longitude: -118.2437,
    isOpen: true,
    pickupTime: 'Ready tomorrow',
    distance: 380,
  },
  {
    id: 'store-4',
    name: 'Salesforce Foundations - Chicago',
    address: '789 Michigan Avenue',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60611',
    country: 'USA',
    phone: '+1 (312) 555-0400',
    hours: 'Open today: 10:00 AM - 7:00 PM',
    latitude: 41.8781,
    longitude: -87.6298,
    isOpen: true,
    pickupTime: 'Ready in 3 hours',
    distance: 1850,
  },
  {
    id: 'store-5',
    name: 'Salesforce Foundations - Seattle',
    address: '100 Pike Street',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    country: 'USA',
    phone: '+1 (206) 555-0500',
    hours: 'Closed today',
    isOpen: false,
    pickupTime: undefined,
    distance: 810,
  },
  {
    id: 'store-6',
    name: 'Salesforce Foundations - Austin',
    address: '200 Congress Avenue',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    country: 'USA',
    phone: '+1 (512) 555-0600',
    hours: 'Open today: 11:00 AM - 7:00 PM',
    latitude: 30.2672,
    longitude: -97.7431,
    isOpen: true,
    pickupTime: 'Ready in 2 hours',
    distance: 1700,
  },
  {
    id: 'store-7',
    name: 'Salesforce Foundations - Miami',
    address: '300 Lincoln Road',
    city: 'Miami Beach',
    state: 'FL',
    zipCode: '33139',
    country: 'USA',
    phone: '+1 (305) 555-0700',
    hours: 'Open today: 10:00 AM - 9:00 PM',
    latitude: 25.7617,
    longitude: -80.1918,
    isOpen: true,
    pickupTime: 'Ready in 4 hours',
    distance: 2650,
  },
  {
    id: 'store-8',
    name: 'Salesforce Foundations - Boston',
    address: '400 Newbury Street',
    city: 'Boston',
    state: 'MA',
    zipCode: '02115',
    country: 'USA',
    phone: '+1 (617) 555-0800',
    hours: 'Open today: 10:00 AM - 8:00 PM',
    latitude: 42.3601,
    longitude: -71.0589,
    isOpen: true,
    pickupTime: 'Ready in 2 hours',
    distance: 2700,
  },
]

// Helper to get store by ID
export function getStoreById(storeId: string): Store | undefined {
  return mockStores.find((store) => store.id === storeId)
}

// Helper to get stores sorted by distance
export function getStoresByDistance(): Store[] {
  return [...mockStores].sort((a, b) => (a.distance || 0) - (b.distance || 0))
}

// Helper to get open stores
export function getOpenStores(): Store[] {
  return mockStores.filter((store) => store.isOpen)
}
