// Enhanced fake-driver reply engine
// Given the user's message and driver metadata, return a reply text and delay (ms).
// The engine supports many common cases (ETA, pickup changes, luggage, payment, cancel, lost items, small talk, and more).
export function getDriverReply(userMessage = '', driver = {}) {
  const normalized = (userMessage || '').toLowerCase().trim()
  const name = driver.name || 'Driver'

  const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const parseNumber = (str) => {
    const m = (str || '').match(/(\d+)\s*(min|mins|minute|minutes|m)?/)
    if (m) return Number(m[1])
    const m2 = (str || '').match(/(\d+)/)
    return m2 ? Number(m2[1]) : null
  }

  if (!normalized) {
    return { text: `Hi, I'm ${name}. How can I help?`, delay: 700 }
  }

  // Direct greetings
  if (/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(normalized)) {
    return { text: randPick([`Hello! This is ${name}. Ready when you are.`, `Hi — I'm on my way. See you soon.`, `Hey! I'll be there shortly.`]), delay: 600 }
  }

  // ETA / arrival questions
  if (/\b(when|where|arriv|eta|how long|how soon)\b/.test(normalized)) {
    const minutes = parseNumber(normalized) || (Math.floor(Math.random() * 6) + 2)
    return { text: `I'll be there in about ${minutes} minute${minutes > 1 ? 's' : ''}. See you at the pickup point.`, delay: 900 }
  }

  // User provides an ETA / says they're waiting
  if (/\b(wait|waiting|i'm here|i am here|i'm at)\b/.test(normalized)) {
    return { text: randPick([`Great — I'm near the pickup, see you in a minute.`, `Thanks, I'll pull up now and stop nearby.`]), delay: 800 }
  }

  // Change pickup location
  if (/\b(change|pickup|pick up|new pickup|meet)\b/.test(normalized) && /\b(at|to|near|by)\b/.test(normalized)) {
    return { text: `Okay, noted the new pickup. I'll head there — please wait at the new spot.`, delay: 1000 }
  }

  // Landmark requests
  if (/\b(landmark|building|next to|in front of|near)\b/.test(normalized)) {
    return { text: `I see. I'll look for the landmark you mentioned and call if I can't find it.`, delay: 900 }
  }

  // License plate / vehicle info
  if (/\b(plate|license|license plate|car|vehicle)\b/.test(normalized)) {
    const plate = driver.vehicle?.licensePlate || 'N/A'
    const vtype = driver.vehicleType || driver.vehicle?.make || 'vehicle'
    return { text: `I'm driving a ${vtype}. Plate: ${plate}. I'll call if you need more details.`, delay: 800 }
  }

  // Luggage / trunk
  if (/\b(luggage|bags|trunk|boot|carry)\b/.test(normalized)) {
    return { text: `No problem — I can help with luggage. I'll bring it to the trunk when I arrive.`, delay: 900 }
  }

  // Cancel flow
  if (/\b(cancel|cancelled|canceling)\b/.test(normalized)) {
    return { text: `If you cancel I will get a notification. Please confirm if you'd like to cancel this booking.`, delay: 1100 }
  }

  // Payment questions
  if (/\b(cash|card|pay|payment|bkcredit)\b/.test(normalized)) {
    return { text: `I accept ${driver.preferredPayment || 'cash or app payment'}. We can sort it when I arrive.`, delay: 900 }
  }

  // Need phone / call
  if (/\b(call|phone|number)\b/.test(normalized)) {
    const phone = driver.phone || null
    if (phone) {
      return { text: `You can call me at ${phone}. I'll answer when I'm nearby.`, delay: 900 }
    }
    return { text: `I can't make calls from here, but I'll message you in the app.`, delay: 900 }
  }

  // Traffic / stuck
  if (/\b(traffic|stuck|jam|delay)\b/.test(normalized)) {
    return { text: `There might be a bit of traffic. I'll try a faster route — ETA may be a few minutes longer.`, delay: 1100 }
  }

  // Lost item
  if (/\b(lost|left|forgot|item)\b/.test(normalized)) {
    return { text: `If you left something, I'll check my car. If I find it I'll let you know and we can arrange pickup.`, delay: 1200 }
  }

  // Tips / small talk
  if (/\b(thank|thanks|ty|great|nice)\b/.test(normalized)) {
    return { text: randPick([`You're welcome!`, `No problem — safe trip!`, `Glad to help.`]), delay: 600 }
  }

  // Confirmations
  if (/\b(ok|okay|sure|yes|yep|yup|confirm)\b/.test(normalized)) {
    return { text: randPick([`Got it. On my way.`, `Okay — see you soon.`, `Roger that.`]), delay: 600 }
  }

  // Ask for exact minutes like "5 min"
  const explicitMins = parseNumber(normalized)
  if (explicitMins && /\b(min|mins|minute|minutes)\b/.test(normalized)) {
    return { text: `Thanks — noted. I'll be there in about ${explicitMins} minute${explicitMins > 1 ? 's' : ''}.`, delay: 700 }
  }

  // Default replies with slight variation
  const defaultReplies = [
    `Got it — I'll head there now.`,
    `Understood, see you shortly.`,
    `Thanks for the update, I'm on my way.`,
    `Okay, I'll wait at the pickup point.`,
    `On my way — I'll message if anything changes.`,
  ]
  return { text: randPick(defaultReplies), delay: 800 + Math.floor(Math.random() * 900) }
}
