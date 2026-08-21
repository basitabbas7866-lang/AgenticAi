import { FaHospital, FaClinicMedical, FaUsers } from "react-icons/fa";

function Stats() {
  const highlights = [
    {
      icon: <FaHospital />,
      label: "Connected Health Facilities",
      value: "2,572",
      detail: "Hospitals & Clinics Integrated"
    },
    {
      icon: <FaClinicMedical />,
      label: "Online Consultations Today",
      value: "2,779",
      detail: "Live SOAP Notes Processed"
    },
    {
      icon: <FaUsers />,
      label: "Total Patient Journeys Managed",
      value: "14,190,958",
      detail: "Digital Records Created"
    }
  ];

  return (
    <section className="py-12 bg-[#f5f7fa]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        {/* Section Heading */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a3b6e] tracking-wide inline-block border-b-2 border-[#1a7f8e] pb-1">
            Highlights &amp; Network Statistics
          </h2>
        </div>

        {/* 3 ORS-Style White Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
            >
              <div className="w-14 h-14 rounded-lg bg-[#1a3b6e] text-amber-300 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                {item.icon}
              </div>

              <div className="flex flex-col text-left w-full">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="text-2xl sm:text-3xl font-serif font-extrabold text-[#1a3b6e] my-1">
                  {item.value}
                </span>
                <div className="flex items-center justify-between text-[11px] text-[#1a7f8e] font-semibold border-t border-slate-100 pt-2 mt-1">
                  <span>{item.detail}</span>
                  <span className="text-[#2b6cb0] hover:underline cursor-pointer">More...</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ORS Timestamp Bar */}
        <div className="text-center mt-6 text-xs text-slate-500 font-medium">
          Last Online System Sync : <span className="font-bold text-slate-700">{new Date().toLocaleDateString('en-GB')} Live Active</span>
        </div>
      </div>
    </section>
  );
}

export default Stats;
