import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Brain, CalendarDays, Check, Home, Sparkles } from "lucide-react";

const COLORS = {
  home: {
    bg: "#E8DDCC",
    bgGlow1: "rgba(221,168,164,.28)",
    bgGlow2: "rgba(201,114,27,.18)",
    title: "#75716d",
    card: "#F7F1E8",
    card2: "#EFE4D4",
    border: "#C9A978",
    accent: "#C9721B",
    progress: "#DDA8A4",
    textMuted: "#7A6A58",
  },
  today: {
    bg: "#F1E6DA",
    bgGlow1: "rgba(201,114,27,.16)",
    bgGlow2: "rgba(221,168,164,.22)",
    title: "#75716d",
    card: "#FFF8EF",
    card2: "#F3E3D2",
    border: "#DDA8A4",
    accent: "#0D5B3E",
    progress: "#DDA8A4",
    textMuted: "#7A6A58",
  },
  history: {
    bg: "#E5D6BF",
    bgGlow1: "rgba(217,182,46,.20)",
    bgGlow2: "rgba(201,114,27,.14)",
    title: "#75716d",
    card: "#F8EFE0",
    card2: "#EFE1C8",
    border: "#C9721B",
    accent: "#0D5B3E",
    progress: "#D9B62E",
    textMuted: "#746550",
  },
  intel: {
    bg: "#DDE5D8",
    bgGlow1: "rgba(13,91,62,.16)",
    bgGlow2: "rgba(221,168,164,.14)",
    title: "#75716d",
    card: "#F6F4EA",
    card2: "#E4EBDD",
    border: "#8AA68A",
    accent: "#C9721B",
    progress: "#0D5B3E",
    textMuted: "#5E6B5B",
  },
};

const CORE_SECTIONS = ["Morning", "Midday", "Evening"];

const SECTION_COLORS = {
  Morning: "#C9721B",
  Midday: "#DDA8A4",
  Evening: "#0D5B3E",
};

const CORE_HABITS = [
  { id: "morningReset", label: "Morning Reset Routine", points: 8, group: "Morning" },
  { id: "planToday", label: "Create Today’s Plan", points: 10, group: "Morning" },
  { id: "movement", label: "Morning Walk / Movement", points: 10, group: "Morning" },

  { id: "eatIntentional", label: "Eat Intentionally", points: 8, group: "Midday" },
  { id: "homeReset", label: "15-Minute Home Reset", points: 5, group: "Midday" },
  { id: "completeProject", label: "Complete One Started Project", points: 10, group: "Midday" },

  { id: "kidConnection", label: "Intentional Kid Connection", points: 8, group: "Evening" },
  { id: "pauseReset", label: "Pause & Reset", points: 5, group: "Evening" },
  { id: "eveningReset", label: "Evening Reset / Prep Tomorrow", points: 5, group: "Evening" },
];

const BONUS_HABITS = [
  { id: "mealPrep", label: "Meal Prep / Healthy Snacks", points: 5 },
  { id: "creativeProject", label: "Creative Home Project Progress", points: 5 },
  { id: "outsideKids", label: "Outside Time With Kids", points: 5 },
  { id: "extraMovement", label: "Extra Movement Session", points: 3 },
  { id: "declutter", label: "Declutter One Small Space", points: 3 },
];

const MAX_CORE_POINTS = 69;
const STORAGE_KEY = "calm-complete-v1";

const TIER_MESSAGES = {
  stable: [
    "You created calm momentum today. That counts.",
    "A steady day is still a win.",
    "You protected the basics. That is how life gets lighter.",
    "Small structure beats scattered effort.",
  ],
  elite: [
    "Separation starts here.",
    "You did more than survive the day. You shaped it.",
    "Confidence comes from kept promises.",
    "This is calm progress turning into proof.",
  ],
  overdrive: [
    "This is what full alignment feels like.",
    "Days like this change trajectories.",
    "You followed through when it would have been easy not to.",
    "This is a big win day.",
  ],
};

function playSound(type = "click") {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.connect(gain);

    if (type === "click") {
      osc.type = "square";
      osc.frequency.setValueAtTime(2600, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.025, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      osc.start(now);
      osc.stop(now + 0.03);
      return;
    }

    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch {}
}

function todayKey() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function shiftDate(dateKey, days) {
  const d = new Date(dateKey + "T00:00:00");
  d.setDate(d.getDate() + days);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function monthDays(dateKey) {
  const d = new Date(dateKey + "T00:00:00");
  const y = d.getFullYear();
  const m = d.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const blanks = Array.from({ length: first.getDay() }, () => null);

  const days = Array.from({ length: last.getDate() }, (_, i) => {
    const day = new Date(y, m, i + 1);
    day.setMinutes(day.getMinutes() - day.getTimezoneOffset());
    return day.toISOString().slice(0, 10);
  });

  return [...blanks, ...days];
}

function monthKey(dateKey) {
  return dateKey.slice(0, 7);
}

function monthLabel(month) {
  const [year, m] = month.split("-");
  return new Date(Number(year), Number(m) - 1, 1).toLocaleString("default", {
    month: "short",
    year: "numeric",
  });
}

function defaultDay() {
  return { core: {}, bonus: {}, closed: false };
}

function isPastDate(dateKey) {
  return dateKey < todayKey();
}

function shouldCountDay(dayKey, dayData) {
  if (!dayData) return false;
  if (dayKey === todayKey() && !dayData.closed) return false;
  return true;
}

function completionFor(day) {
  const safeDay = day || defaultDay();

  const core = CORE_HABITS.reduce(
    (sum, h) => sum + (safeDay.core?.[h.id] ? h.points : 0),
    0
  );

  const bonus = BONUS_HABITS.reduce(
    (sum, h) => sum + (safeDay.bonus?.[h.id] ? h.points : 0),
    0
  );

  return {
    core,
    bonus,
    total: core + bonus,
    corePercent: Math.round((core / MAX_CORE_POINTS) * 100),
    totalPercent: Math.round(((core + bonus) / MAX_CORE_POINTS) * 100),
  };
}

function getTier(score) {
  if (score.totalPercent >= 109) {
    return { label: "Overflow Day", color: "#B8860B", key: "overdrive" };
  }

  if (score.corePercent >= 85) {
    return { label: "Complete Day", color: "#0D5B3E", key: "elite" };
  }

  if (score.corePercent >= 55) {
    return { label: "Calm Day", color: "#C9721B", key: "stable" };
  }

  return { label: "Scattered Day", color: "#A66A5B", key: "drift" };
}

function getNextMove(day, score) {
  if (score.corePercent >= 55) return "Day stabilized. Keep it calm and finish well.";

  const open = CORE_HABITS.filter((h) => !day?.core?.[h.id]);
  const picks = ["Plan", "Body", "Home", "Family"]
    .map((group) => open.find((h) => h.group === group))
    .filter(Boolean)
    .slice(0, 2);

  if (!picks.length) return "One small reset finishes the day stronger.";
  return picks.map((p) => p.label).join(" + ");
}

function getHeatClass(dayKey, day) {
  if (!shouldCountDay(dayKey, day)) return "bg-[#EFE4D4] text-[#7A6A58]";

  const score = completionFor(day);

  if (score.totalPercent >= 109) return "bg-[#B8860B] text-white";
  if (score.corePercent >= 85) return "bg-[#0D5B3E] text-white";
  if (score.corePercent >= 55) return "bg-[#C9721B] text-white";
  return "bg-[#DDA8A4] text-[#3B2F2A]";
}

function getRandomMessage(tierKey) {
  const messages = TIER_MESSAGES[tierKey] || [];
  return messages[Math.floor(Math.random() * messages.length)] || "";
}

function getSectionScore(day, section) {
  const habits = CORE_HABITS.filter((h) => h.group === section);
  const earned = habits.reduce(
    (sum, h) => sum + (day.core?.[h.id] ? h.points : 0),
    0
  );
  const max = habits.reduce((sum, h) => sum + h.points, 0);
  const percent = max ? Math.round((earned / max) * 100) : 0;
  return { earned, max, percent };
}

function monthlyStats(data, targetMonth) {
  const keys = Object.keys(data).filter(
    (k) => monthKey(k) === targetMonth && shouldCountDay(k, data[k])
  );

  if (!keys.length) {
    return { month: targetMonth, avg: 0, drift: 0, stable: 0, elite: 0, overdrive: 0, bestStreak: 0, days: 0 };
  }

  let drift = 0;
  let stable = 0;
  let elite = 0;
  let overdrive = 0;
  let totalPct = 0;
  let currentStreak = 0;
  let bestStreak = 0;

  keys.sort().forEach((k) => {
    const score = completionFor(data[k]);
    totalPct += score.totalPercent;

    if (score.totalPercent >= 109) overdrive += 1;
    else if (score.corePercent >= 85) elite += 1;
    else if (score.corePercent >= 55) stable += 1;
    else drift += 1;

    if (score.corePercent >= 55) {
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  return {
    month: targetMonth,
    avg: Math.round(totalPct / keys.length),
    drift,
    stable,
    elite,
    overdrive,
    bestStreak,
    days: keys.length,
  };
}

function allTimeStats(data) {
  const keys = Object.keys(data).filter((k) => shouldCountDay(k, data[k]));

  return keys.reduce(
    (acc, k) => {
      const score = completionFor(data[k]);

      if (score.totalPercent >= 109) acc.overdrive += 1;
      else if (score.corePercent >= 85) acc.elite += 1;
      else if (score.corePercent >= 55) acc.stable += 1;
      else acc.drift += 1;

      return acc;
    },
    { drift: 0, stable: 0, elite: 0, overdrive: 0 }
  );
}

function ProgressRing({ score }) {
  const clamped = Math.max(0, Math.min(100, score.corePercent));
  const tier = getTier(score);

  return (
    <div
      className="relative mx-auto grid h-44 w-44 place-items-center rounded-full shadow-lg"
      style={{
        background: `conic-gradient(${tier.color} ${clamped * 3.6}deg, rgba(255,255,255,.55) 0deg)`,
      }}
    >
      <div
        className="absolute inset-3 rounded-full border"
        style={{ backgroundColor: COLORS.home.card, borderColor: COLORS.home.border }}
      />
      <div className="relative text-center">
        <div className="text-4xl font-black tracking-tight" style={{ color: COLORS.home.title }}>
          {score.core}
        </div>
        <div className="text-xs font-semibold" style={{ color: COLORS.home.textMuted }}>
          / {MAX_CORE_POINTS} Points
        </div>
        <div className="mt-1 text-xs font-black" style={{ color: tier.color }}>
          {tier.label}
        </div>
      </div>
    </div>
  );
}

function XpBurst({ burst }) {
  return (
    <AnimatePresence>
      {burst && (
        <motion.div
          key={burst.id}
          initial={{ opacity: 0, y: 10, scale: 0.85 }}
          animate={{ opacity: 1, y: -44, scale: 1 }}
          exit={{ opacity: 0, y: -74, scale: 0.95 }}
          transition={{ duration: 0.75 }}
          className="pointer-events-none fixed left-1/2 top-1/2 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-2xl font-black shadow-xl backdrop-blur"
          style={{
            backgroundColor: "rgba(201,114,27,.18)",
            border: "1px solid rgba(201,114,27,.35)",
            color: COLORS.home.accent,
          }}
        >
          +{burst.points} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TierPopup({ popup, onClose }) {
  return (
    <AnimatePresence>
      {popup && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.18 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: popup.color }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            className="fixed left-1/2 top-1/2 z-50 w-[86%] max-w-sm -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className="rounded-[2rem] border-2 px-7 py-7 text-center shadow-2xl"
              style={{
                backgroundColor: COLORS.home.card,
                borderColor: popup.color,
                color: "#3B2F2A",
              }}
            >
              <div className="text-4xl font-black tracking-tight" style={{ color: popup.color }}>
                {popup.label}
              </div>
              <p className="mt-4 text-sm font-bold leading-6">{popup.message}</p>
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  onClose();
                }}
                className="mt-6 w-full rounded-2xl px-4 py-3 text-sm font-black"
                style={{ backgroundColor: COLORS.home.card2, color: COLORS.home.title }}
              >
                Continue
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SectionProgress({ section, day }) {
  const { earned, max, percent } = getSectionScore(day, section);
  const color = SECTION_COLORS[section] || COLORS.today.progress;

  return (
    <div
      className="mb-2 rounded-2xl p-3"
      style={{ backgroundColor: "rgba(255,255,255,.35)", border: "1px solid rgba(0,0,0,.08)" }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-black uppercase tracking-widest" style={{ color: COLORS.today.textMuted }}>
          {section}
        </div>
        <div className="text-xs font-black" style={{ color: COLORS.today.accent }}>
          {earned}/{max}
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(0,0,0,.12)" }}>
        <motion.div
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.35 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function HabitRow({ habit, checked, locked = false, disabled = false, onToggle, bonus = false }) {
  const isDisabled = locked || disabled;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      onClick={() => !isDisabled && onToggle(habit)}
      className={`flex w-full items-center gap-3 border-b px-3 py-4 text-left last:border-b-0 ${isDisabled ? "opacity-30" : ""}`}
      style={{ borderColor: "rgba(0,0,0,.08)" }}
    >
      <div
        className="grid h-7 w-7 place-items-center rounded-full border"
        style={{
          borderColor: checked ? COLORS.today.accent : COLORS.today.border,
          backgroundColor: checked ? COLORS.today.accent : COLORS.today.card2,
          color: checked ? "#fff" : COLORS.today.textMuted,
        }}
      >
        {checked && <Check size={17} strokeWidth={4} />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate font-bold" style={{ color: "#3B2F2A" }}>
            {habit.label}
          </div>
          {bonus && <Sparkles size={14} style={{ color: COLORS.today.accent }} />}
        </div>
        {!bonus && <div className="text-xs" style={{ color: COLORS.today.textMuted }}>{habit.group}</div>}
      </div>

      <div className="font-black" style={{ color: COLORS.today.accent }}>
        +{habit.points}
      </div>
    </motion.button>
  );
}

function Stat({ label, value, theme = "home" }) {
  const c = theme === "history" ? COLORS.history : theme === "intel" ? COLORS.intel : COLORS.home;

  return (
    <div
      className="rounded-2xl p-3 text-center shadow-sm"
      style={{ backgroundColor: c.card2, border: `1px solid ${c.border}` }}
    >
      <div className="text-2xl font-black" style={{ color: c.title }}>{value}</div>
      <div className="mt-1 text-[10px] font-black uppercase tracking-wider" style={{ color: c.textMuted }}>
        {label}
      </div>
    </div>
  );
}

const NAV_STYLES = {
  home: { bg: COLORS.home.card2, color: COLORS.home.title },
  today: { bg: COLORS.today.card2, color: COLORS.today.title },
  history: { bg: COLORS.history.card2, color: COLORS.history.title },
  insights: { bg: COLORS.intel.card2, color: COLORS.intel.title },
};

function NavButton({ active, onClick, icon, label, tabKey }) {
  const style = active ? NAV_STYLES[tabKey] : { bg: "transparent", color: "#8B7B68" };

  return (
    <button
      type="button"
      onClick={() => {
        playSound("click");
        onClick();
      }}
      className="flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-black transition"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {icon}
      {label}
    </button>
  );
}

function MonthlyBar({ month }) {
  const width = Math.max(0, Math.min(135, month.avg));

  return (
    <div
      className="rounded-2xl p-3"
      style={{ backgroundColor: COLORS.history.card2, border: `1px solid ${COLORS.history.border}` }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-black" style={{ color: "#3B2F2A" }}>{monthLabel(month.month)}</div>
        <div className="text-xs font-black" style={{ color: COLORS.history.accent }}>{month.avg}%</div>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(0,0,0,.12)" }}>
        <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: COLORS.history.progress }} />
      </div>
    </div>
  );
}

export default function LifeScoreboard() {
  const [date, setDate] = useState(todayKey());
  const [tab, setTab] = useState("home");
  const [data, setData] = useState({});
  const [burst, setBurst] = useState(null);
  const [tierPopup, setTierPopup] = useState(null);
  const [triggeredTiers, setTriggeredTiers] = useState([]);

  useEffect(() => {
    try {
      const loaded = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const closedPastDays = { ...loaded };

      Object.keys(closedPastDays).forEach((key) => {
        if (isPastDate(key) && !closedPastDays[key]?.closed) {
          closedPastDays[key] = { ...defaultDay(), ...closedPastDays[key], closed: true };
        }
      });

      setData(closedPastDays);
    } catch {
      setData({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    setTriggeredTiers([]);
  }, [date]);

  const rawDay = data[date] || defaultDay();
  const day = isPastDate(date) && !rawDay.closed ? { ...rawDay, closed: true } : rawDay;
  const score = completionFor(day);

  const loggedKeys = Object.keys(data).filter((k) => shouldCountDay(k, data[k])).sort();
  const selectedMonth = monthKey(date);
  const thisMonthStats = monthlyStats(data, selectedMonth);
  const totals = allTimeStats(data);

  const stats = useMemo(() => {
    const last7 = Array.from({ length: 7 }, (_, i) => shiftDate(todayKey(), i - 6))
      .filter((k) => shouldCountDay(k, data[k]));

    const avg = last7.length
      ? last7.reduce((sum, k) => sum + completionFor(data[k]).totalPercent, 0) / last7.length
      : 0;

    let streak = 0;
    let cursor = shouldCountDay(todayKey(), data[todayKey()]) ? todayKey() : shiftDate(todayKey(), -1);

    while (shouldCountDay(cursor, data[cursor]) && completionFor(data[cursor]).corePercent >= 55) {
      streak += 1;
      cursor = shiftDate(cursor, -1);
    }

    const wins = loggedKeys.filter((k) => completionFor(data[k]).corePercent >= 55).length;

    const bestStreak = loggedKeys.reduce(
      (acc, k) => {
        const win = completionFor(data[k]).corePercent >= 55;
        const cur = win ? acc.cur + 1 : 0;
        return { cur, best: Math.max(acc.best, cur) };
      },
      { cur: 0, best: 0 }
    ).best;

    return { avg: Math.round(avg), streak, wins, bestStreak };
  }, [data, loggedKeys.length]);

  const insights = useMemo(() => {
    if (!loggedKeys.length) return ["No Pattern Yet. Log A Few Days First."];

    const rates = CORE_HABITS.map((h) => {
      const done = loggedKeys.filter((k) => data[k]?.core?.[h.id]).length;
      return { ...h, rate: Math.round((done / loggedKeys.length) * 100) };
    }).sort((a, b) => a.rate - b.rate);

    return [
      stats.avg < 55
        ? "Drift Detected: The average is below stable. Lower the chaos before adding more."
        : "Pattern Looks Solid: Keep stacking calm, finished days.",
      `Weakest Habit: ${rates[0].label} (${rates[0].rate}%).`,
      `Strongest Habit: ${rates[rates.length - 1].label} (${rates[rates.length - 1].rate}%).`,
    ];
  }, [data, loggedKeys.length, stats.avg]);

  const monthlyComparison = useMemo(() => {
    const months = [...new Set(Object.keys(data).filter((k) => shouldCountDay(k, data[k])).map(monthKey))]
      .sort()
      .reverse();

    return months.map((m) => monthlyStats(data, m));
  }, [data]);

  function updateDay(updater) {
    setData((prev) => {
      const current = prev[date] || defaultDay();
      return { ...prev, [date]: updater(current) };
    });
  }

  function triggerBurst(points) {
    const id = Date.now();
    setBurst({ id, points });
    setTimeout(() => setBurst((b) => (b?.id === id ? null : b)), 700);
  }

  function triggerTier(updatedScore) {
    const tier = getTier(updatedScore);
    if (tier.key === "drift") return;
    if (triggeredTiers.includes(tier.key)) return;

    setTriggeredTiers((prev) => [...prev, tier.key]);
    playSound("pop");

    setTierPopup({
      id: Date.now(),
      label: tier.label,
      color: tier.color,
      key: tier.key,
      message: getRandomMessage(tier.key),
    });
  }

  function toggleCore(habit) {
    if (day.closed) return;

    playSound("click");

    const currently = Boolean(day.core?.[habit.id]);
    const updatedCore = { ...day.core, [habit.id]: !currently };
    const simulatedDay = { ...day, core: updatedCore };
    const updatedScore = completionFor(simulatedDay);

    updateDay((d) => ({ ...d, core: updatedCore }));

    if (!currently) {
      playSound("pop");
      triggerBurst(habit.points);
      triggerTier(updatedScore);
    }
  }

  function toggleBonus(habit) {
    if (day.closed) return;

    playSound("click");

    const currently = Boolean(day.bonus?.[habit.id]);
    const updatedBonus = { ...day.bonus, [habit.id]: !currently };
    const simulatedDay = { ...day, bonus: updatedBonus };
    const updatedScore = completionFor(simulatedDay);

    updateDay((d) => ({ ...d, bonus: updatedBonus }));

    if (!currently) {
      playSound("pop");
      triggerBurst(habit.points);
      triggerTier(updatedScore);
    }
  }

  function toggleCloseDay() {
    playSound("click");
    updateDay((d) => ({ ...d, closed: !d.closed }));
  }

  function openHistoryDay(dayKey) {
    playSound("click");
    setDate(dayKey);
    setTab("today");
  }

  const bonusUnlocked = score.corePercent >= 85;
  const availableBonus = BONUS_HABITS.map((h) => ({ ...h, locked: !bonusUnlocked }));
  const last7 = Array.from({ length: 7 }, (_, i) => shiftDate(todayKey(), i - 6));

  const familyScore = CORE_HABITS.filter((h) => h.group === "Family").reduce(
    (sum, h) => sum + (day.core?.[h.id] ? h.points : 0),
    0
  );

  const familyMax = CORE_HABITS.filter((h) => h.group === "Family").reduce(
    (sum, h) => sum + h.points,
    0
  );

  const currentTheme =
    tab === "today" ? COLORS.today : tab === "history" ? COLORS.history : tab === "insights" ? COLORS.intel : COLORS.home;

  return (
    <div
      className="min-h-screen px-4 pb-28 pt-5"
      style={{
        color: "#3B2F2A",
        background: `
          radial-gradient(circle at 15% 10%, ${currentTheme.bgGlow1}, transparent 28%),
          radial-gradient(circle at 88% 18%, ${currentTheme.bgGlow2}, transparent 30%),
          ${currentTheme.bg}
        `,
      }}
    >
      <XpBurst burst={burst} />
      <TierPopup popup={tierPopup} onClose={() => setTierPopup(null)} />

      <div className="mx-auto max-w-md">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black tracking-tighter" style={{ color: currentTheme.title }}>
              Calm & Complete
            </h1>
            <p className="mt-1 text-sm" style={{ color: currentTheme.textMuted }}>
              Calm routines. Finished days.
            </p>
          </div>

          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="max-w-[142px] rounded-2xl px-3 py-2 text-sm font-bold outline-none"
            style={{
              backgroundColor: currentTheme.card,
              border: `1px solid ${currentTheme.border}`,
              color: "#3B2F2A",
            }}
          />
        </header>

        {tab === "home" && (
          <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <section
              className="rounded-[2rem] p-5 shadow-lg"
              style={{ backgroundColor: COLORS.home.card, border: `1px solid ${COLORS.home.border}` }}
            >
              <ProgressRing score={score} />

              <div className="mt-5 text-center">
                <div className="text-6xl font-black tracking-tighter" style={{ color: COLORS.home.title }}>
                  {score.totalPercent}%
                </div>
                <div className="mt-1 text-sm" style={{ color: COLORS.home.textMuted }}>XP Percentage</div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <Stat label="Current Streak" value={stats.streak} />
                <Stat label="Stable+ Month" value={thisMonthStats.stable + thisMonthStats.elite + thisMonthStats.overdrive} />
                <Stat label="Month Avg XP" value={`${thisMonthStats.avg}%`} />
              </div>

              <div
                className="mt-4 rounded-2xl p-3 text-sm font-bold"
                style={{
                  backgroundColor: "rgba(201,114,27,.13)",
                  border: `1px solid rgba(201,114,27,.25)`,
                  color: COLORS.home.accent,
                }}
              >
                Today&apos;s Next Move: {getNextMove(day, score)}
              </div>
            </section>

            <section
              className="mt-4 rounded-[1.7rem] p-4"
              style={{ backgroundColor: COLORS.home.card, border: `1px solid ${COLORS.home.border}` }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-black" style={{ color: COLORS.home.title }}>Family</div>
                  <div className="text-xs" style={{ color: COLORS.home.textMuted }}>Priority #1</div>
                </div>
                <div className="font-black" style={{ color: COLORS.home.accent }}>
                  {familyScore}/{familyMax}
                </div>
              </div>

              <div className="grid gap-2">
                {CORE_HABITS.filter((h) => h.group === "Family").map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => toggleCore(h)}
                    disabled={day.closed}
                    className={`flex items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-bold ${day.closed ? "opacity-40" : ""}`}
                    style={{
                      backgroundColor: day.core?.[h.id] ? "rgba(13,91,62,.15)" : COLORS.home.card2,
                      border: `1px solid ${day.core?.[h.id] ? COLORS.home.title : COLORS.home.border}`,
                      color: "#3B2F2A",
                    }}
                  >
                    <span>{h.label}</span>
                    <span style={{ color: COLORS.home.accent }}>+{h.points}</span>
                  </button>
                ))}
              </div>
            </section>

            <section
              className="mt-4 rounded-[1.7rem] p-4"
              style={{ backgroundColor: COLORS.home.card, border: `1px solid ${COLORS.home.border}` }}
            >
              <div className="mb-3">
                <div className="font-black" style={{ color: COLORS.home.title }}>Last 7 Days</div>
                <div className="text-xs" style={{ color: COLORS.home.textMuted }}>Heat Strip</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {last7.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => openHistoryDay(k)}
                    className={`h-10 rounded-xl border ${getHeatClass(k, data[k])}`}
                  />
                ))}
              </div>
            </section>

            <section
              className="mt-4 rounded-[1.7rem] p-4"
              style={{ backgroundColor: COLORS.home.card, border: `1px solid ${COLORS.home.border}` }}
            >
              <div className="font-black" style={{ color: COLORS.home.title }}>Latest Insight</div>
              <p className="mt-2 text-sm leading-6" style={{ color: "#3B2F2A" }}>{insights[0]}</p>
            </section>
          </motion.main>
        )}

        {tab === "today" && (
          <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <section
              className="rounded-[1.7rem] p-4"
              style={{ backgroundColor: COLORS.today.card, border: `1px solid ${COLORS.today.border}` }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="font-black" style={{ color: COLORS.today.title }}>Core XP</div>
                  <div className="text-xs" style={{ color: COLORS.today.textMuted }}>
                    {day.closed ? "Day Locked" : "Always Available"}
                  </div>
                </div>
                <div className="font-black" style={{ color: COLORS.today.accent }}>
                  {score.core}/{MAX_CORE_POINTS}
                </div>
              </div>

              {CORE_SECTIONS.map((section) => {
                const habits = CORE_HABITS.filter((h) => h.group === section);
                if (!habits.length) return null;

                return (
                  <div
                    key={section}
                    className="mb-4 overflow-hidden rounded-3xl last:mb-0"
                    style={{ backgroundColor: COLORS.today.card2, border: `1px solid ${COLORS.today.border}` }}
                  >
                    <div className="px-4 py-3">
                      <SectionProgress section={section} day={day} />
                    </div>

                    {habits.map((h) => (
                      <HabitRow
                        key={h.id}
                        habit={h}
                        checked={Boolean(day.core?.[h.id])}
                        disabled={day.closed}
                        onToggle={toggleCore}
                      />
                    ))}
                  </div>
                );
              })}
            </section>

            <section
              className="mt-4 rounded-[1.7rem] p-4"
              style={{ backgroundColor: COLORS.today.card, border: `1px solid ${COLORS.today.border}` }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="font-black" style={{ color: COLORS.today.title }}>Bonus XP</div>
                  <div className="text-xs" style={{ color: COLORS.today.textMuted }}>
                    Unlocks After 85% Core Momentum
                  </div>
                </div>
                <div className="font-black" style={{ color: COLORS.today.accent }}>+{score.bonus}</div>
              </div>

              <div
                className="overflow-hidden rounded-3xl"
                style={{ backgroundColor: COLORS.today.card2, border: `1px solid ${COLORS.today.border}` }}
              >
                {availableBonus.map((h) => (
                  <HabitRow
                    key={h.id}
                    habit={h}
                    checked={Boolean(day.bonus?.[h.id])}
                    locked={h.locked}
                    disabled={day.closed}
                    onToggle={toggleBonus}
                    bonus
                  />
                ))}
              </div>
            </section>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={toggleCloseDay}
              className="mt-4 w-full rounded-[1.75rem] px-6 py-6 text-lg font-black tracking-tight shadow-lg"
              style={{
                backgroundColor: day.closed ? "#8B7B68" : COLORS.today.accent,
                color: "#fff",
                border: "2px solid rgba(0,0,0,.2)",
              }}
            >
              {day.closed ? "🔓 Unlock Day" : "🏁 Finish Day"}
            </motion.button>
          </motion.main>
        )}

        {tab === "history" && (
          <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <section
              className="rounded-[1.7rem] p-4"
              style={{ backgroundColor: COLORS.history.card, border: `1px solid ${COLORS.history.border}` }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="font-black" style={{ color: COLORS.history.title }}>History</div>
                  <div className="text-xs" style={{ color: COLORS.history.textMuted }}>Monthly Heatmap</div>
                </div>
                <div className="text-sm font-black" style={{ color: COLORS.history.accent }}>Best {stats.bestStreak}</div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black" style={{ color: COLORS.history.textMuted }}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={`${d}-${i}`}>{d}</div>)}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-2">
                {monthDays(date).map((k, i) => {
                  if (!k) return <div key={`blank-${i}`} />;

                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => openHistoryDay(k)}
                      className={`grid aspect-square place-items-center rounded-xl border text-xs font-black ${getHeatClass(k, data[k])}`}
                    >
                      {new Date(k + "T00:00:00").getDate()}
                    </button>
                  );
                })}
              </div>
            </section>

            <section
              className="mt-4 rounded-[1.7rem] p-4"
              style={{ backgroundColor: COLORS.history.card, border: `1px solid ${COLORS.history.border}` }}
            >
              <div className="font-black" style={{ color: COLORS.history.title }}>All-Time Stats</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Stat label="Drift Days" value={totals.drift} theme="history" />
                <Stat label="Stable Days" value={totals.stable} theme="history" />
                <Stat label="Elite Days" value={totals.elite} theme="history" />
                <Stat label="Overdrive Days" value={totals.overdrive} theme="history" />
              </div>
            </section>

            <section
              className="mt-4 rounded-[1.7rem] p-4"
              style={{ backgroundColor: COLORS.history.card, border: `1px solid ${COLORS.history.border}` }}
            >
              <div className="font-black" style={{ color: COLORS.history.title }}>Monthly Comparison</div>
              <div className="mt-3 space-y-3">
                {monthlyComparison.length ? monthlyComparison.map((m) => <MonthlyBar key={m.month} month={m} />) : (
                  <div className="text-sm" style={{ color: COLORS.history.textMuted }}>No Month Data Yet.</div>
                )}
              </div>
            </section>
          </motion.main>
        )}

        {tab === "insights" && (
          <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <section
              className="rounded-[1.7rem] p-4"
              style={{ backgroundColor: COLORS.intel.card, border: `1px solid ${COLORS.intel.border}` }}
            >
              <div className="font-black" style={{ color: COLORS.intel.title }}>Daily Rhythm</div>

              <div
                className="mt-3 overflow-hidden rounded-3xl"
                style={{ backgroundColor: COLORS.intel.card2, border: `1px solid ${COLORS.intel.border}` }}
              >
                {insights.map((x, i) => (
                  <div key={i} className="border-b px-4 py-4 text-sm leading-6 last:border-b-0" style={{ borderColor: COLORS.intel.border, color: "#3B2F2A" }}>
                    {x}
                  </div>
                ))}
              </div>
            </section>
          </motion.main>
        )}
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 border-t px-3 py-3 backdrop-blur-xl"
        style={{ backgroundColor: "rgba(247,241,232,.92)", borderColor: "rgba(0,0,0,.08)" }}
      >
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          <NavButton active={tab === "home"} onClick={() => setTab("home")} icon={<Home size={18} />} label="Home" tabKey="home" />
          <NavButton active={tab === "today"} onClick={() => setTab("today")} icon={<Activity size={18} />} label="Today" tabKey="today" />
          <NavButton active={tab === "history"} onClick={() => setTab("history")} icon={<CalendarDays size={18} />} label="History" tabKey="history" />
          <NavButton active={tab === "insights"} onClick={() => setTab("insights")} icon={<Brain size={18} />} label="Rhythm" tabKey="insights" />
        </div>
      </nav>
    </div>
  );
}
