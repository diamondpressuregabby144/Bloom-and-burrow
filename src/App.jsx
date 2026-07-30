import { useState, useEffect, useMemo } from "react";
import {
  Heart, ShoppingBag, Sparkles, ClipboardList, Home, Plus, X, ExternalLink,
  Search, Trash2, User, LogOut, MapPin, Star, Phone, Navigation, CheckCircle2, Clock
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { CARE_PROVIDERS, haversineMiles, mapsDirectionsUrl } from "./careProviders";

const COLORS = {
  bg: "#F4F1E6", surface: "#FFFFFF", ink: "#26302A",
  forest: "#2F4538", ochre: "#C98A3E", mauve: "#9C6B7A", line: "#E3DECE",
};

const CATEGORIES = [
  { id: "sleep", label: "Sleep & Bassinet", need: "You need a bassinet", icon: "🛏️" },
  { id: "diapering", label: "Diapering", need: "You need diapers", icon: "🧷" },
  { id: "feeding", label: "Feeding & Formula", need: "You need feeding supplies", icon: "🍼" },
  { id: "clothing", label: "Clothing", need: "You need onesies & layers", icon: "👕" },
  { id: "bathing", label: "Bath & Skin", need: "You need bath basics", icon: "🛁" },
  { id: "transport", label: "Car Seat & Stroller", need: "You need a car seat", icon: "🚼" },
  { id: "health", label: "Health & Nursery Safety", need: "You need a thermometer & monitor", icon: "🩺" },
  { id: "toys", label: "Toys & Development", need: "You need first toys", icon: "🧸" },
  { id: "momrecovery", label: "Mom Recovery", need: "You need postpartum care items", icon: "🌸" },
  { id: "feeding-mom", label: "Nursing & Pumping", need: "You need nursing gear", icon: "🤱" },
];

const REGISTRY_ITEMS = {
  sleep: [
    { name: "Organic Cotton Bassinet Sheet Set", tags: ["organic", "GOTS cotton"], site: "Burt's Bees Baby", url: "https://www.burtsbeesbaby.com/" },
    { name: "Non-Toxic Foam Bassinet Mattress", tags: ["low-chemical", "CertiPUR"], site: "Newton Baby", url: "https://www.newtonbaby.com/" },
    { name: "Smart Bassinet (Snoo)", tags: ["new", "premium"], site: "Happiest Baby", url: "https://www.happiestbaby.com/" },
  ],
  diapering: [
    { name: "Plant-Based Diapers, fragrance-free", tags: ["organic", "chlorine-free"], site: "Coterie", url: "https://www.coterie.com/" },
    { name: "EWG-Verified Diapers", tags: ["organic", "EWG verified"], site: "Healthybaby", url: "https://healthybaby.com/" },
    { name: "Bamboo Compostable Diapers", tags: ["organic", "compostable"], site: "Dyper", url: "https://dyper.com/" },
    { name: "Plant-Derived Diapers", tags: ["low-chemical"], site: "Hello Bello", url: "https://hellobello.com/" },
  ],
  feeding: [
    { name: "Organic Baby Food Pouches", tags: ["organic", "USDA organic"], site: "Once Upon a Farm", url: "https://onceuponafarmorganics.com/" },
    { name: "Clean-Ingredient Purees", tags: ["organic"], site: "Serenity Kids", url: "https://serenitykids.com/" },
    { name: "Glass Baby Bottles", tags: ["low-chemical", "BPA-free"], site: "Dr. Brown's", url: "https://www.drbrownsbaby.com/" },
    { name: "Pantry Organic Formula & Snacks", tags: ["organic"], site: "Thrive Market", url: "https://thrivemarket.com/" },
  ],
  clothing: [
    { name: "GOTS Organic Cotton Layette", tags: ["organic", "GOTS"], site: "Hanna Andersson", url: "https://www.hannaandersson.com/" },
    { name: "Bamboo Viscose Sleepers", tags: ["low-chemical", "OEKO-TEX"], site: "Kyte Baby", url: "https://kytebaby.com/" },
    { name: "Organic Cotton Basics", tags: ["organic"], site: "Monica + Andy", url: "https://www.monicaandandy.com/" },
  ],
  bathing: [
    { name: "Fragrance-Free Baby Wash", tags: ["low-chemical", "EWG verified"], site: "Healthybaby", url: "https://healthybaby.com/" },
    { name: "Organic Baby Lotion", tags: ["organic"], site: "Burt's Bees Baby", url: "https://www.burtsbeesbaby.com/" },
  ],
  transport: [
    { name: "Flame-Retardant-Free Car Seat", tags: ["low-chemical"], site: "Nuna", url: "https://www.nunababy.com/" },
    { name: "Lightweight Everyday Stroller", tags: ["new"], site: "UPPAbaby", url: "https://www.uppababy.com/" },
  ],
  health: [
    { name: "No-Touch Thermometer", tags: ["new"], site: "Babylist Registry", url: "https://www.babylist.com/" },
    { name: "Video Monitor", tags: ["new"], site: "Nanit", url: "https://www.nanit.com/" },
  ],
  toys: [
    { name: "Untreated Wood & Organic Fabric Toys", tags: ["organic", "low-chemical"], site: "Monica + Andy", url: "https://www.monicaandandy.com/" },
    { name: "Registry-Popular First Toys", tags: ["new"], site: "Babylist", url: "https://www.babylist.com/" },
  ],
  momrecovery: [
    { name: "Organic Cotton Postpartum Pads", tags: ["organic"], site: "Rael", url: "https://www.getrael.com/" },
    { name: "Fragrance-Free Perineal Care", tags: ["low-chemical"], site: "Frida Mom", url: "https://www.fridamom.com/" },
  ],
  "feeding-mom": [
    { name: "Silicone Nursing Pads", tags: ["low-chemical", "BPA-free"], site: "Haakaa", url: "https://haakaa.com/" },
    { name: "Hospital-Grade Pump", tags: ["new"], site: "Spectra Baby USA", url: "https://spectrababyusa.com/" },
  ],
};

const MILESTONE_GROUPS = [
  { id: "feeding", label: "Feeding", items: ["Establish feeding routine", "Introduce solids", "Track ounces/day"] },
  { id: "sleep", label: "Sleep", items: ["Bassinet in room", "Move to crib", "Drop a nap"] },
  { id: "diapering", label: "Diapering", items: ["Stock size 1", "Size-up check", "Start potty awareness"] },
  { id: "growth", label: "Growth & Health", items: ["2-week checkup", "2-month vaccines", "Weight/length log"] },
  { id: "development", label: "Development", items: ["Tummy time daily", "First smile", "Rolling over"] },
  { id: "bonding", label: "Bonding", items: ["Skin-to-skin", "Reading together", "Babywearing"] },
  { id: "momrecovery", label: "Mom Recovery", items: ["6-week checkup", "Pelvic floor check-in", "Rest & hydration"] },
  { id: "gear", label: "Gear Setup", items: ["Car seat installed", "Nursery baby-proofed", "Outlets covered"] },
];

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function Tag({ children, tone = "ochre" }) {
  const bg = tone === "ochre" ? "#F3E3C8" : tone === "mauve" ? "#EFE0E4" : "#DEE7DE";
  const fg = tone === "ochre" ? "#8A5E1F" : tone === "mauve" ? "#7A4B58" : "#2F4538";
  return (
    <span style={{ background: bg, color: fg, fontFamily: "'IBM Plex Mono', monospace" }}
      className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full">{children}</span>
  );
}

function SectionLabel({ eyebrow, title }) {
  return (
    <div className="mb-4">
      <div style={{ color: COLORS.ochre, fontFamily: "'IBM Plex Mono', monospace" }} className="text-xs uppercase tracking-widest mb-1">{eyebrow}</div>
      <h2 style={{ color: COLORS.forest, fontFamily: "'Fraunces', serif" }} className="text-2xl font-semibold">{title}</h2>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");

  const [tab, setTab] = useState("home");
  const [healthSubTab, setHealthSubTab] = useState("vitals");
  const [babyStage, setBabyStage] = useState({ mode: "pregnant", week: 24 });
  const [milestones, setMilestones] = useState({});
  const [heartLogs, setHeartLogs] = useState([]);
  const [hrInput, setHrInput] = useState("");

  const [registryOpen, setRegistryOpen] = useState(null);
  const [registryLevel, setRegistryLevel] = useState("new");
  const [listings, setListings] = useState([]);
  const [listingsLoaded, setListingsLoaded] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [newListing, setNewListing] = useState({ title: "", category: "sleep", price: "", condition: "Gently used", note: "", city: "" });
  const [marketFilter, setMarketFilter] = useState("all");
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [myLoc, setMyLoc] = useState(null);
  const [locStatus, setLocStatus] = useState("idle");

  const [activity, setActivity] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfile(null); return; }
    supabase.from("profiles").select("*").eq("id", session.user.id).single()
      .then(({ data }) => setProfile(data));
  }, [session]);

  useEffect(() => {
    loadListings();
    loadActivity();
    const listingsSub = supabase.channel("listings-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "listings" }, loadListings)
      .subscribe();
    const activitySub = supabase.channel("activity-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity" }, loadActivity)
      .subscribe();
    return () => { supabase.removeChannel(listingsSub); supabase.removeChannel(activitySub); };
  }, []);

  async function loadListings() {
    const { data } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
    setListings(data || []);
    setListingsLoaded(true);
  }

  async function loadActivity() {
    const { data } = await supabase.from("activity").select("*").order("created_at", { ascending: false }).limit(100);
    setActivity(data || []);
  }

  async function pushActivity(kind, text) {
    await supabase.from("activity").insert({ user_id: session.user.id, username: profile.username, kind, text });
    loadActivity();
  }

  async function handleAuth() {
    setAuthError("");
    const { username, email, password } = authForm;
    if (!email || !password || (authMode === "signup" && !username)) {
      setAuthError("Fill in all fields."); return;
    }
    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setAuthError(error.message); return; }
      if (data.user) {
        const { error: profErr } = await supabase.from("profiles").insert({ id: data.user.id, username: username.trim() });
        if (profErr) { setAuthError("Username may already be taken — try another."); return; }
      }
      if (!data.session) setAuthError("Check your email to confirm your account, then log in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    }
  }

  async function signOut() { await supabase.auth.signOut(); }

  function useMyLocation() {
    setLocStatus("locating");
    if (!navigator.geolocation) { setLocStatus("unsupported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setMyLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocStatus("ready"); },
      () => setLocStatus("denied"),
      { timeout: 8000 }
    );
  }

  function toggleMilestone(groupId, item) {
    const key = `${groupId}::${item}`;
    setMilestones((m) => ({ ...m, [key]: !m[key] }));
  }

  function addHeartLog() {
    const bpm = parseInt(hrInput, 10);
    if (!bpm || bpm < 40 || bpm > 220) return;
    setHeartLogs((logs) => [{ bpm, t: new Date().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) }, ...logs].slice(0, 12));
    setHrInput("");
  }

  async function submitListing() {
    if (!newListing.title.trim()) return;
    const entry = {
      poster_id: session.user.id, poster_name: profile.username,
      title: newListing.title.trim(), category: newListing.category,
      price: newListing.price ? Number(newListing.price) : 0,
      condition: newListing.condition, note: newListing.note.trim(),
      city: newListing.city.trim() || null, lat: myLoc?.lat ?? null, lng: myLoc?.lng ?? null,
    };
    await supabase.from("listings").insert(entry);
    await pushActivity("listed", `posted "${entry.title}" to the marketplace`);
    setNewListing({ title: "", category: "sleep", price: "", condition: "Gently used", note: "", city: "" });
    setShowPost(false);
    loadListings();
  }

  async function removeListing(id) {
    await supabase.from("listings").delete().eq("id", id);
    loadListings();
  }

  async function markSold(listing) {
    await supabase.from("listings").update({ sold: true }).eq("id", listing.id);
    await pushActivity("sold", `marked "${listing.title}" as sold`);
    loadListings();
  }

  async function markPurchased(item, categoryLabel) {
    await pushActivity("purchased", `checked off "${item.name}" (${categoryLabel}) from the registry`);
  }

  const totalMilestones = MILESTONE_GROUPS.reduce((n, g) => n + g.items.length, 0);
  const doneMilestones = Object.values(milestones).filter(Boolean).length;

  const listingsWithDistance = useMemo(() =>
    listings.map((l) => ({ ...l, distance: myLoc ? haversineMiles(myLoc.lat, myLoc.lng, l.lat, l.lng) : null })),
    [listings, myLoc]
  );

  const marketListings = useMemo(() => {
    let out = listingsWithDistance.filter((l) => marketFilter === "all" || l.category === marketFilter);
    if (myLoc) out = out.filter((l) => l.distance == null || l.distance <= radiusMiles);
    out.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
    return out;
  }, [listingsWithDistance, marketFilter, myLoc, radiusMiles]);

  const registryUsed = useMemo(() => {
    if (!registryOpen) return [];
    return listingsWithDistance.filter((l) => l.category === registryOpen).sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
  }, [listingsWithDistance, registryOpen]);

  const myActivity = activity.filter((a) => a.user_id === session?.user?.id);

  if (authLoading) return <div style={{ background: COLORS.bg }} className="min-h-screen" />;

  if (!session || !profile) {
    return (
      <div style={{ background: COLORS.bg, fontFamily: "Figtree, sans-serif" }} className="min-h-screen flex items-center justify-center p-6">
        <div style={{ background: COLORS.surface, borderColor: COLORS.line }} className="w-full max-w-sm rounded-2xl border p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🌿</div>
            <h1 style={{ color: COLORS.forest, fontFamily: "Fraunces, serif" }} className="text-3xl font-semibold mb-1">Bloom &amp; Burrow</h1>
            <p style={{ color: COLORS.mauve }} className="text-sm">A gentler way to track, register, and pass things on.</p>
          </div>
          <div className="flex mb-4 rounded-xl overflow-hidden border" style={{ borderColor: COLORS.line }}>
            {["login", "signup"].map((m) => (
              <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); }}
                style={{ background: authMode === m ? COLORS.forest : "transparent", color: authMode === m ? "white" : COLORS.ink }}
                className="flex-1 py-2 text-sm font-medium capitalize">{m === "login" ? "Log in" : "Sign up"}</button>
            ))}
          </div>
          <div className="space-y-3">
            {authMode === "signup" && (
              <input placeholder="Username (shown to others)" value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                style={{ borderColor: COLORS.line }} className="w-full border rounded-xl px-4 py-2.5 outline-none" />
            )}
            <input placeholder="Email" type="email" value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              style={{ borderColor: COLORS.line }} className="w-full border rounded-xl px-4 py-2.5 outline-none" />
            <input type="password" placeholder="Password" value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              style={{ borderColor: COLORS.line }} className="w-full border rounded-xl px-4 py-2.5 outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleAuth()} />
            {authError && <p className="text-xs" style={{ color: "#B3454F" }}>{authError}</p>}
            <button onClick={handleAuth} style={{ background: COLORS.forest }} className="w-full text-white rounded-xl py-2.5 font-medium hover:opacity-90 transition">
              {authMode === "login" ? "Log in" : "Create account"}
            </button>
          </div>
          <p className="text-[11px] mt-4" style={{ color: "#9AA39A" }}>
            Real accounts — passwords are handled by Supabase Auth (hashed, never stored in plain text).
          </p>
        </div>
      </div>
    );
  }

  const NAV = [
    { id: "home", label: "Tracker", icon: Home },
    { id: "registry", label: "Registry", icon: ClipboardList },
    { id: "market", label: "Market", icon: ShoppingBag },
    { id: "organic", label: "Low-Chem", icon: Sparkles },
    { id: "health", label: "Health", icon: Heart },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div style={{ background: COLORS.bg, fontFamily: "Figtree, sans-serif", color: COLORS.ink }} className="min-h-screen pb-24">
      <div style={{ background: COLORS.forest }} className="text-white px-5 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span style={{ fontFamily: "Fraunces, serif" }} className="text-lg font-semibold">Bloom &amp; Burrow</span>
        </div>
        <button onClick={() => setTab("profile")} className="text-sm opacity-90 flex items-center gap-1">
          <User size={14} /> {profile.username}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-5 pt-6">
        {tab === "home" && (
          <HomeTab babyStage={babyStage} setBabyStage={setBabyStage} milestones={milestones} toggleMilestone={toggleMilestone}
            doneMilestones={doneMilestones} totalMilestones={totalMilestones} activity={activity.slice(0, 6)} />
        )}
        {tab === "registry" && !registryOpen && <RegistryList onOpen={(id) => { setRegistryOpen(id); setRegistryLevel("new"); }} />}
        {tab === "registry" && registryOpen && (
          <RegistryDetail categoryId={registryOpen} level={registryLevel} setLevel={setRegistryLevel}
            onBack={() => setRegistryOpen(null)} usedListings={registryUsed}
            onOpenPost={() => { setNewListing((n) => ({ ...n, category: registryOpen })); setShowPost(true); }}
            onMarkPurchased={markPurchased} />
        )}
        {tab === "market" && (
          <MarketTab filtered={marketListings} filter={marketFilter} setFilter={setMarketFilter}
            onPost={() => { setNewListing((n) => ({ ...n, category: marketFilter === "all" ? "sleep" : marketFilter })); setShowPost(true); }}
            onRemove={removeListing} onSold={markSold} userId={session.user.id} loaded={listingsLoaded}
            radiusMiles={radiusMiles} setRadiusMiles={setRadiusMiles} myLoc={myLoc} locStatus={locStatus} useMyLocation={useMyLocation} />
        )}
        {tab === "organic" && <OrganicTab />}
        {tab === "health" && (
          <div>
            <div className="flex gap-2 mb-4">
              {[{ id: "vitals", label: "Vitals log" }, { id: "care", label: "Find care near you" }].map((s) => (
                <button key={s.id} onClick={() => setHealthSubTab(s.id)}
                  style={{ background: healthSubTab === s.id ? COLORS.forest : COLORS.surface, color: healthSubTab === s.id ? "white" : COLORS.ink, borderColor: COLORS.line }}
                  className="text-xs px-3 py-2 rounded-xl border flex-1">{s.label}</button>
              ))}
            </div>
            {healthSubTab === "vitals" ? (
              <HeartTab hrInput={hrInput} setHrInput={setHrInput} addHeartLog={addHeartLog} heartLogs={heartLogs} />
            ) : (
              <CareTab myLoc={myLoc} locStatus={locStatus} useMyLocation={useMyLocation} />
            )}
          </div>
        )}
        {tab === "profile" && <ProfileTab profile={profile} onSignOut={signOut} myActivity={myActivity} />}
      </div>

      {showPost && <PostModal newListing={newListing} setNewListing={setNewListing} onSubmit={submitListing} onClose={() => setShowPost(false)} myLoc={myLoc} />}

      <div style={{ background: COLORS.surface, borderColor: COLORS.line }} className="fixed bottom-0 left-0 right-0 border-t px-1 py-2 flex justify-around z-20">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = tab === n.id;
          return (
            <button key={n.id} onClick={() => { setTab(n.id); if (n.id !== "registry") setRegistryOpen(null); }}
              className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg transition"
              style={{ color: active ? COLORS.forest : "#9AA39A" }}>
              <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />
              <span className="text-[9.5px] font-medium">{n.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}function HomeTab({ babyStage, setBabyStage, milestones, toggleMilestone, doneMilestones, totalMilestones, activity }) {
  const pct = Math.round((doneMilestones / totalMilestones) * 100);
  return (
    <div className="space-y-6">
      <div style={{ background: COLORS.surface, borderColor: COLORS.line }} className="rounded-2xl border p-5">
