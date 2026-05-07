export async function searchCarRentals({ pickUpLat, pickUpLon, dropOffLat, dropOffLon, pickUpDate, dropOffDate, pickUpTime = '10:00', dropOffTime = '10:00', driverAge = 30, currency = 'USD', location = 'US' } = {}) {
  const base = import.meta.env.VITE_BOOKING_BASE_URL || 'https://booking-com15.p.rapidapi.com/api/v1/cars/searchCarRentals'
  const host = import.meta.env.VITE_RAPIDAPI_HOST || 'booking-com15.p.rapidapi.com'
  const key = import.meta.env.VITE_RAPIDAPI_KEY
  // If no key is configured, return null so callers can gracefully fallback
  if (!key) return null

  const params = new URLSearchParams({
    pick_up_latitude: String(pickUpLat ?? ''),
    pick_up_longitude: String(pickUpLon ?? ''),
    drop_off_latitude: String(dropOffLat ?? ''),
    drop_off_longitude: String(dropOffLon ?? ''),
    pick_up_date: String(pickUpDate),
    drop_off_date: String(dropOffDate),
    pick_up_time: pickUpTime,
    drop_off_time: dropOffTime,
    driver_age: String(driverAge),
    currency_code: currency,
    location,
  })

  const url = `${base}?${params.toString()}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': key,
      'x-rapidapi-host': host,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Booking API error ${res.status}: ${text}`)
  }

  return res.json()
}

export default { searchCarRentals }
