const TERMS = [
  {
    term: 'ADR',
    full: 'Average Daily Rate',
    def: 'The average rental income per paid occupied room in a given time period. Calculated as: Total Room Revenue / Total Rooms Sold.',
  },
  {
    term: 'RevPAR',
    full: 'Revenue Per Available Room',
    def: "A performance metric used to assess a hotel's ability to fill its available rooms at an average rate. Calculated as: Total Room Revenue / Total Rooms Available.",
  },
  {
    term: 'Net RevPAR',
    full: 'Net Revenue Per Available Room',
    def: 'Revenue remaining after deducting acquisition costs like OTA commissions. This is the true measure of profitability.',
  },
  {
    term: 'Occupancy',
    full: 'Occupancy Rate',
    def: 'The percentage of all available rooms that are currently booked or occupied.',
  },
  {
    term: 'Pace / Pickup',
    full: 'Booking Pace',
    def: 'The rate at which reservations are being made for a particular date. If you book 10 rooms today for a date next month, your pickup is 10. Pace compares this pickup against historical patterns.',
  },
  {
    term: 'OTB',
    full: 'On The Books',
    def: 'The actual, confirmed number of reservations currently sitting in the system for a future date.',
  },
  {
    term: 'LOS',
    full: 'Length of Stay',
    def: "The number of nights a guest stays at the hotel. Often used in restrictions (e.g., 'Min 2-night LOS') to prevent 1-night stays from ruining weekend availability.",
  },
  {
    term: 'MTD / YTD',
    full: 'Month-to-Date / Year-to-Date',
    def: 'The period starting from the beginning of the current month (or year) up until today.',
  },
  {
    term: 'Block Wash',
    full: 'Group Wash',
    def: "The difference between the number of rooms initially blocked for a group and the number of rooms actually picked up (booked) by the group attendees. These unbooked rooms 'wash' back into public inventory.",
  },
  {
    term: 'Walk',
    full: 'Walking a Guest',
    def: "When a hotel is overbooked and a guest arrives with a reservation, the hotel must 'walk' them to a comparable nearby hotel and pay for their stay.",
  },
  {
    term: 'Displacement',
    full: 'Segment Displacement',
    def: 'Turning away lower-paying guests (or high-commission OTA bookings) today to save the room for a higher-paying, direct booking guest expected closer to the arrival date.',
  },
]

export default function GlossaryView() {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800">Metrics & Terminology Glossary</h3>
          <p className="text-sm text-slate-500 mt-1">
            A simple guide to common revenue management terms used in this system.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {TERMS.map((item, idx) => (
            <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-baseline mb-2">
                <h4 className="text-lg font-bold text-blue-700 mr-3">{item.term}</h4>
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  {item.full}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">{item.def}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
