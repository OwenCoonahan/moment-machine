export type Customer = {
  id: string
  name: string
  phone: string
  region: string
  teamAffinity: string
  lastPurchaseCategory: string
  loyaltyTier: string
  averageOrderValue: string
  marketingOptIn: boolean
}

export const MOCK_CUSTOMERS_CSV = `id,name,phone,region,team_affinity,last_purchase_category,loyalty_tier,average_order_value,marketing_opt_in
1,Avery Cole,5552010001,Northeast,Patriots,jersey,Gold,128,true
2,Jordan Lee,5552010002,Northeast,Patriots,hat,Silver,64,true
3,Morgan Blake,5552010003,Northeast,Jaguars,hoodie,Bronze,52,true
4,Casey Brooks,5552010004,Northeast,Giants,jersey,Gold,140,true
5,Riley Quinn,5552010005,Northeast,Jets,tshirt,Silver,45,true
6,Hayden Park,5552010006,Midwest,Bears,hoodie,Bronze,49,true
7,Quinn Patel,5552010007,Midwest,Lions,jersey,Silver,92,true
8,Jamie Rivera,5552010008,Midwest,Packers,hat,Gold,110,true
9,Harper Kim,5552010009,Midwest,Chiefs,jersey,Gold,156,true
10,Rowan Gray,5552010010,South,Cowboys,hoodie,Silver,88,true
11,Logan Ellis,5552010011,South,Saints,tshirt,Bronze,39,true
12,Parker Reed,5552010012,South,Buccaneers,hat,Silver,57,true
13,Emerson Fox,5552010013,South,Texans,jersey,Gold,132,true
14,Sawyer Hall,5552010014,West,49ers,jersey,Gold,148,true
15,Finley Ward,5552010015,West,Seahawks,hoodie,Silver,78,true
16,Reese Stone,5552010016,West,Chargers,hat,Bronze,42,true
17,Bailey Cruz,5552010017,West,Rams,jersey,Gold,120,true
18,Alex Morgan,5552010018,Northeast,Patriots,jersey,Gold,112,false
19,Drew Martin,5552010019,South,Colts,tshirt,Bronze,35,true
20,Taylor James,5552010020,Midwest,Vikings,hoodie,Silver,66,true
21,Blake Carter,5552010021,Northeast,Patriots,hat,Silver,58,true
22,Shawn Price,5552010022,West,49ers,tshirt,Bronze,33,true
23,Micah Bell,5552010023,South,Texans,jersey,Gold,124,true
24,Tyler Nash,5552010024,Midwest,Bears,hat,Silver,54,true
25,Avery Woods,5552010025,Northeast,Giants,hoodie,Bronze,48,true
26,Jordan Price,5552010026,West,Seahawks,jersey,Gold,138,true
27,Skyler Ross,5552010027,South,Cowboys,jersey,Gold,145,true
28,Devon Patel,5552010028,Midwest,Packers,tshirt,Silver,60,true
29,Reagan Lane,5552010029,Northeast,Jets,hat,Bronze,38,true
30,Charlie Young,5552010030,West,Rams,hoodie,Silver,72,true`

export const REGION_OPTIONS = ['Northeast', 'South', 'Midwest', 'West']

export type SmsDraft = {
  eventText: string
  offerText: string
  businessName: string
  businessType: string
}

export type DemoEvent = {
  description?: string
  player?: string
  teamFull?: string
  label?: string
  type?: string
}

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (digits.length === 10) return `+1${digits}`
  if (phone.startsWith('+')) return phone
  return phone
}

export const parseCustomersCsv = (text: string): Customer[] => {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim())

  return lines.slice(1).map((line) => {
    const values = line.split(',').map(v => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = values[i] || ''
    })
    return {
      id: row.id,
      name: row.name,
      phone: normalizePhone(row.phone),
      region: row.region,
      teamAffinity: row.team_affinity,
      lastPurchaseCategory: row.last_purchase_category,
      loyaltyTier: row.loyalty_tier,
      averageOrderValue: row.average_order_value,
      marketingOptIn: row.marketing_opt_in === 'true',
    }
  })
}

export const filterByRegion = (customers: Customer[], region: string) => {
  if (!region || region === 'All') return customers
  return customers.filter((c) => c.region === region)
}

export const buildMessage = (draft: SmsDraft) => {
  const { eventText, offerText, businessName, businessType } = draft
  return `${eventText} ${offerText} ${businessName} (${businessType})`
    .replace(/\s+/g, ' ')
    .trim()
}

export const summarizeSegment = (customers: Customer[]) => {
  const total = customers.length
  const optedIn = customers.filter((c) => c.marketingOptIn).length
  const regions = Array.from(new Set(customers.map((c) => c.region)))
  return { total, optedIn, regions }
}

export const buildPromoFromEvent = (event: DemoEvent, draft: SmsDraft) => {
  const headline =
    event.player
      ? `${event.player} just scored!`
      : event.label
        ? `${event.label} just happened!`
        : event.description || 'Big game moment!'
  const offer = '10% off jerseys for the next 2 hours.'
  const tagline = `${draft.businessName} - Your Source for Fan Favorite Gear`
  return `${headline} ${offer} ${tagline}.`.replace(/\s+/g, ' ').trim()
}
