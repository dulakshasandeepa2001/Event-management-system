import React from "react";

const eventCards = [
  {
    id: 1,
    category: "Community",
    date: "2026-04-04",
    title: "AI Tools for Student Leaders",
    location: "Main Hall, Campus Center",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    category: "Seminar",
    date: "2026-04-11",
    title: "Modern Marketing Summit",
    location: "Innovation Hub",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    category: "Workshop",
    date: "2026-04-20",
    title: "Registration Bootcamp",
    location: "Auditorium B",
    image:
      "https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    category: "Campus Event",
    date: "2026-05-02",
    title: "Culture & Innovation Night",
    location: "Open Arena",
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    category: "Training",
    date: "2026-05-13",
    title: "Machine Learning Fastlane",
    location: "Lab Complex 3",
    image:
      "https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    category: "Conference",
    date: "2026-05-21",
    title: "Partner Collaboration Pavilion",
    location: "Business Block",
    image:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80",
  },
];

const Events = () => {
  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-6 md:p-8">
      <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
        <section className="relative h-72 md:h-80 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1800&q=80"
            alt="Event hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />
          <div className="absolute left-6 md:left-10 bottom-8">
            <p className="text-slate-200 text-xs tracking-[0.2em] uppercase">Event Management</p>
            <h1 className="text-4xl md:text-5xl font-bold mt-2">Events</h1>
          </div>
        </section>

        <section className="bg-slate-100 text-slate-900 px-6 md:px-8 py-8 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {eventCards.map((event) => (
              <article
                key={event.id}
                className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition"
              >
                <img src={event.image} alt={event.title} className="w-full h-44 object-cover" />
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold uppercase tracking-wide">
                      {event.category}
                    </span>
                    <span className="text-slate-500">{event.date}</span>
                  </div>
                  <h3 className="text-xl font-bold leading-tight">{event.title}</h3>
                  <p className="text-sm text-slate-500 mt-3">{event.location}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Events;
