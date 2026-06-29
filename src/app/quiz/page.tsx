"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/layout/Nav";

interface Question {
  id: string;
  question: string;
  options: string[];
}

interface QuizResult {
  correctIndex: number;
  selectedIndex: number;
  explanation: string;
  isCorrect: boolean;
}

type Phase =
  | "loading-profile"
  | "generating"
  | "quiz"
  | "submitting"
  | "passed"
  | "failed"
  | "already-qualified"
  | "error";

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function QuizPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading-profile");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [displayScore, setDisplayScore] = useState(0);
  const [skills, setSkills] = useState("");
  const scoreRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("receipt_profile");
      if (!raw) { router.push("/profile"); return; }
      const profile = JSON.parse(raw);
      if (!profile.name || profile.role !== "worker") { router.push("/profile"); return; }
      if (profile.quizPassed) { setPhase("already-qualified"); return; }
      if (!profile.skills?.trim()) {
        setErrorMsg("Please add your skills to your profile before taking the assessment.");
        setPhase("error");
        return;
      }
      if (!profile.walletAddress || profile.walletAddress.startsWith("pending")) {
        setErrorMsg("Connect a wallet to your profile before taking the assessment.");
        setPhase("error");
        return;
      }
      // Enforce 24h cooldown after a failed attempt
      const lastAttempt = localStorage.getItem("quiz_last_attempt");
      if (lastAttempt) {
        const elapsed = Date.now() - parseInt(lastAttempt, 10);
        const cooldown = 24 * 60 * 60 * 1000;
        if (elapsed < cooldown) {
          const hoursLeft = Math.ceil((cooldown - elapsed) / (60 * 60 * 1000));
          setErrorMsg(`Assessment on cooldown. You can retake in ${hoursLeft} hour${hoursLeft !== 1 ? "s" : ""}.`);
          setPhase("error");
          return;
        } else {
          localStorage.removeItem("quiz_last_attempt");
        }
      }
      setSkills(profile.skills);
      generateQuiz(profile.walletAddress, profile.skills);
    } catch {
      router.push("/profile");
    }
  }, [router]);

  async function generateQuiz(walletAddress: string, skillsStr: string) {
    setPhase("generating");
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, skills: skillsStr }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to generate quiz.");
        setPhase("error");
        return;
      }
      if (data.alreadyPassed) {
        setPhase("already-qualified");
        return;
      }
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(null));
      setPhase("quiz");
    } catch {
      setErrorMsg("Connection error. Please try again.");
      setPhase("error");
    }
  }

  function selectAnswer(optionIdx: number) {
    setAnswers(prev => {
      const next = [...prev];
      next[currentQ] = optionIdx;
      return next;
    });
  }

  function goNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
    }
  }

  function goPrev() {
    if (currentQ > 0) setCurrentQ(q => q - 1);
  }

  async function submitQuiz() {
    if (answers.some(a => a === null)) return;
    setPhase("submitting");
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Submission failed.");
        setPhase("error");
        return;
      }
      setScore(data.score);
      setCorrect(data.correct);
      setResults(data.results || []);

      if (data.passed) {
        // Update localStorage
        try {
          const raw = localStorage.getItem("receipt_profile");
          if (raw) {
            const p = JSON.parse(raw);
            p.quizPassed = true;
            p.quizScore = data.score;
            localStorage.setItem("receipt_profile", JSON.stringify(p));
          }
        } catch {}
        setPhase("passed");
      } else {
        // Store last attempt timestamp for 24h cooldown
        localStorage.setItem("quiz_last_attempt", Date.now().toString());
        setPhase("failed");
      }
    } catch {
      setErrorMsg("Connection error during submission.");
      setPhase("error");
    }
  }

  // Animate score counter on results screen
  useEffect(() => {
    if (phase === "passed" || phase === "failed") {
      setDisplayScore(0);
      let current = 0;
      const target = score;
      const step = Math.ceil(target / 30);
      scoreRef.current = setInterval(() => {
        current = Math.min(current + step, target);
        setDisplayScore(current);
        if (current >= target) clearInterval(scoreRef.current!);
      }, 40);
    }
    return () => { if (scoreRef.current) clearInterval(scoreRef.current); };
  }, [phase, score]);

  const progress = questions.length > 0
    ? ((answers.filter(a => a !== null).length) / questions.length) * 100
    : 0;

  const allAnswered = answers.length > 0 && answers.every(a => a !== null);
  const isLast = currentQ === questions.length - 1;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "#fff" }}>
      <Nav />

      <AnimatePresence mode="wait">

        {/* LOADING PROFILE */}
        {phase === "loading-profile" && (
          <motion.div key="loading-profile"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}
          >
            <div style={{ display: "flex", gap: 5 }}>
              {[0, 0.15, 0.3].map(d => (
                <div key={d} style={{
                  width: 6, height: 6, borderRadius: "50%", background: "var(--green)", opacity: 0.4,
                  animation: `thinking 1.1s ${d}s ease-in-out infinite`,
                }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* GENERATING */}
        {phase === "generating" && (
          <motion.div key="generating"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 20, padding: 24 }}
          >
            <div style={{ position: "relative", width: 64, height: 64, marginBottom: 8 }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: "2px solid transparent",
                borderTopColor: "var(--green)",
                animation: "spin 0.9s linear infinite",
              }} />
              <div style={{
                position: "absolute", inset: 6, borderRadius: "50%",
                border: "2px solid transparent",
                borderTopColor: "rgba(0,229,195,0.3)",
                animation: "spin 1.4s linear infinite reverse",
              }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Generating your assessment</p>
              <p style={{ fontSize: 17, color: "var(--text-3)" }}>
                AI is creating questions based on: <span style={{ color: "var(--green)" }}>{skills}</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* QUIZ */}
        {phase === "quiz" && questions.length > 0 && (
          <motion.div key="quiz"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ maxWidth: 680, margin: "0 auto", padding: "100px 20px 60px" }}
          >
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.04em", marginBottom: 4 }}>
                    Skills Assessment
                  </h1>
                  <p style={{ fontSize: 16, color: "var(--text-3)" }}>
                    {skills} · 70% to qualify
                  </p>
                </div>
                <span style={{
                  fontSize: 16, fontWeight: 600, color: "var(--text-2)",
                  padding: "6px 14px", borderRadius: 999,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  {answers.filter(a => a !== null).length} / {questions.length} answered
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ height: "100%", background: "var(--green)", borderRadius: 999 }}
                />
              </div>
            </div>

            {/* Question card */}
            <AnimatePresence mode="wait">
              <motion.div key={currentQ}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%)",
                  backdropFilter: "blur(30px) saturate(180%)",
                  WebkitBackdropFilter: "blur(30px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 24, padding: 28, marginBottom: 14,
                  boxShadow: "0 16px 40px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.08)",
                }}
              >
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 10px", borderRadius: 999, marginBottom: 18,
                  background: "rgba(0,229,195,0.08)", border: "1px solid rgba(0,229,195,0.2)",
                  fontSize: 14, fontWeight: 700, color: "var(--green)", letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  Question {currentQ + 1} of {questions.length}
                </div>

                <p style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.5, marginBottom: 24, letterSpacing: "-0.01em" }}>
                  {questions[currentQ].question}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {questions[currentQ].options.map((opt, idx) => {
                    const selected = answers[currentQ] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => selectAnswer(idx)}
                        style={{
                          display: "flex", alignItems: "flex-start", gap: 14,
                          padding: "14px 18px", borderRadius: 14, cursor: "pointer",
                          border: selected ? "1.5px solid var(--green)" : "1.5px solid rgba(255,255,255,0.07)",
                          background: selected
                            ? "linear-gradient(135deg, rgba(0,229,195,0.12) 0%, rgba(0,229,195,0.05) 100%)"
                            : "rgba(255,255,255,0.02)",
                          color: "var(--text-1)", textAlign: "left",
                          transition: "all 0.18s ease",
                          boxShadow: selected ? "0 0 0 1px rgba(0,229,195,0.15)" : "none",
                        }}
                        onMouseEnter={e => {
                          if (!selected) {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
                            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                          }
                        }}
                        onMouseLeave={e => {
                          if (!selected) {
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                          }
                        }}
                      >
                        <span style={{
                          flexShrink: 0, width: 26, height: 26, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 700,
                          background: selected ? "var(--green)" : "rgba(255,255,255,0.06)",
                          color: selected ? "#060E0A" : "var(--text-3)",
                          border: selected ? "none" : "1px solid rgba(255,255,255,0.08)",
                          transition: "all 0.18s ease",
                        }}>
                          {OPTION_LABELS[idx]}
                        </span>
                        <span style={{ fontSize: 17, lineHeight: 1.55, paddingTop: 3 }}>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={goPrev}
                disabled={currentQ === 0}
                style={{
                  padding: "12px 20px", borderRadius: 12, fontSize: 16, fontWeight: 600,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: currentQ === 0 ? "var(--text-3)" : "var(--text-1)",
                  cursor: currentQ === 0 ? "default" : "pointer",
                  opacity: currentQ === 0 ? 0.4 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                ← Back
              </button>

              <div style={{ flex: 1, display: "flex", gap: 6, justifyContent: "center" }}>
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    style={{
                      width: 8, height: 8, borderRadius: "50%", border: "none", padding: 0,
                      cursor: "pointer",
                      background: i === currentQ
                        ? "var(--green)"
                        : answers[i] !== null
                        ? "rgba(0,229,195,0.4)"
                        : "rgba(255,255,255,0.12)",
                      transition: "background 0.2s ease",
                    }}
                  />
                ))}
              </div>

              {isLast ? (
                <button
                  onClick={submitQuiz}
                  disabled={!allAnswered}
                  className="btn-primary"
                  style={{
                    padding: "12px 22px", borderRadius: 12, fontSize: 16, fontWeight: 700,
                    opacity: allAnswered ? 1 : 0.45,
                    cursor: allAnswered ? "pointer" : "default",
                  }}
                >
                  Submit Assessment →
                </button>
              ) : (
                <button
                  onClick={goNext}
                  disabled={answers[currentQ] === null}
                  style={{
                    padding: "12px 22px", borderRadius: 12, fontSize: 16, fontWeight: 700,
                    background: answers[currentQ] !== null
                      ? "linear-gradient(180deg, #23FFE0, #00D7C2)"
                      : "rgba(255,255,255,0.08)",
                    color: answers[currentQ] !== null ? "#060E0A" : "var(--text-3)",
                    border: "none", cursor: answers[currentQ] !== null ? "pointer" : "default",
                    opacity: answers[currentQ] !== null ? 1 : 0.5,
                    transition: "all 0.18s ease",
                  }}
                >
                  Next →
                </button>
              )}
            </div>

            {!allAnswered && isLast && (
              <p style={{ textAlign: "center", fontSize: 15, color: "var(--text-3)", marginTop: 12 }}>
                Answer all questions before submitting
              </p>
            )}
          </motion.div>
        )}

        {/* SUBMITTING */}
        {phase === "submitting" && (
          <motion.div key="submitting"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16, padding: 24 }}
          >
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "var(--green)", animation: "spin 0.9s linear infinite" }} />
            <p style={{ fontSize: 19, fontWeight: 600 }}>Evaluating your answers…</p>
          </motion.div>
        )}

        {/* PASSED */}
        {phase === "passed" && (
          <motion.div key="passed"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ maxWidth: 560, margin: "0 auto", padding: "100px 20px 60px" }}
          >
            <div style={{
              background: "linear-gradient(135deg, rgba(0,229,195,0.1) 0%, transparent 60%)",
              backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
              border: "1px solid rgba(0,229,195,0.25)",
              borderRadius: 28, padding: 36, textAlign: "center",
              boxShadow: "0 24px 60px rgba(0,229,195,0.08), 0 0 80px rgba(0,229,195,0.04)",
            }}>
              {/* Badge */}
              <div style={{
                width: 72, height: 72, borderRadius: "50%", margin: "0 auto 20px",
                background: "linear-gradient(135deg, #00E5C3, #00B89C)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 32px rgba(0,229,195,0.35)",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#060E0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>

              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.05em", marginBottom: 8, color: "var(--green)" }}>
                Qualified!
              </h1>
              <p style={{ fontSize: 17, color: "var(--text-2)", marginBottom: 24, lineHeight: 1.6 }}>
                You passed the skills assessment. Your profile now shows a <strong style={{ color: "var(--green)" }}>Qualified</strong> badge visible to all clients.
              </p>

              {/* Score */}
              <div style={{
                display: "inline-flex", alignItems: "baseline", gap: 4,
                padding: "12px 24px", borderRadius: 999, marginBottom: 28,
                background: "rgba(0,229,195,0.08)", border: "1px solid rgba(0,229,195,0.2)",
              }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>
                  {displayScore}
                </span>
                <span style={{ fontSize: 18, color: "var(--green)", fontWeight: 700 }}>%</span>
                <span style={{ fontSize: 17, color: "var(--text-3)", marginLeft: 8 }}>
                  {correct} / {results.length} correct
                </span>
              </div>

              {/* Results breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left", marginBottom: 28 }}>
                {results.map((r, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px",
                    borderRadius: 10,
                    background: r.isCorrect ? "rgba(0,229,195,0.06)" : "rgba(255,68,68,0.06)",
                    border: `1px solid ${r.isCorrect ? "rgba(0,229,195,0.15)" : "rgba(255,68,68,0.15)"}`,
                  }}>
                    <div style={{
                      flexShrink: 0, width: 20, height: 20, borderRadius: "50%", marginTop: 1,
                      background: r.isCorrect ? "var(--green)" : "rgba(255,68,68,0.8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {r.isCorrect
                        ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#060E0A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: r.isCorrect ? "var(--green)" : "#ff6666", marginBottom: 2 }}>
                        Question {i + 1}: {r.isCorrect ? "Correct" : "Incorrect"}
                      </div>
                      <div style={{ fontSize: 15, color: "var(--text-3)", lineHeight: 1.5 }}>{r.explanation}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push("/profile")}
                className="btn-primary"
                style={{ width: "100%", padding: "14px", borderRadius: 14, fontSize: 17, fontWeight: 700 }}
              >
                View your profile →
              </button>
            </div>
          </motion.div>
        )}

        {/* FAILED */}
        {phase === "failed" && (
          <motion.div key="failed"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ maxWidth: 560, margin: "0 auto", padding: "100px 20px 60px" }}
          >
            <div style={{
              background: "linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 40%)",
              backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 28, padding: 36, textAlign: "center",
              boxShadow: "0 16px 40px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.08)",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%", margin: "0 auto 20px",
                background: "rgba(255,170,0,0.12)", border: "1px solid rgba(255,170,0,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFAA00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>

              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.05em", marginBottom: 8, color: "#FFAA00" }}>
                Almost there
              </h1>
              <p style={{ fontSize: 17, color: "var(--text-2)", marginBottom: 20, lineHeight: 1.6 }}>
                You need 70% to qualify. Review the explanations below and retake the assessment in 24 hours.
              </p>

              <div style={{
                display: "inline-flex", alignItems: "baseline", gap: 4,
                padding: "12px 24px", borderRadius: 999, marginBottom: 28,
                background: "rgba(255,170,0,0.08)", border: "1px solid rgba(255,170,0,0.2)",
              }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: "#FFAA00", fontVariantNumeric: "tabular-nums" }}>
                  {displayScore}
                </span>
                <span style={{ fontSize: 18, color: "#FFAA00", fontWeight: 700 }}>%</span>
                <span style={{ fontSize: 17, color: "var(--text-3)", marginLeft: 8 }}>
                  {correct} / {results.length} correct · need {Math.ceil(results.length * 0.7)}
                </span>
              </div>

              {/* Results breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left", marginBottom: 28 }}>
                {results.map((r, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px",
                    borderRadius: 10,
                    background: r.isCorrect ? "rgba(0,229,195,0.06)" : "rgba(255,68,68,0.06)",
                    border: `1px solid ${r.isCorrect ? "rgba(0,229,195,0.15)" : "rgba(255,68,68,0.15)"}`,
                  }}>
                    <div style={{
                      flexShrink: 0, width: 20, height: 20, borderRadius: "50%", marginTop: 1,
                      background: r.isCorrect ? "var(--green)" : "rgba(255,68,68,0.8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {r.isCorrect
                        ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#060E0A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: r.isCorrect ? "var(--green)" : "#ff6666", marginBottom: 2 }}>
                        Question {i + 1}: {r.isCorrect ? "Correct" : `Incorrect (correct: ${OPTION_LABELS[r.correctIndex]})`}
                      </div>
                      <div style={{ fontSize: 15, color: "var(--text-3)", lineHeight: 1.5 }}>{r.explanation}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => router.push("/profile")}
                  style={{
                    flex: 1, padding: "13px", borderRadius: 14, fontSize: 17, fontWeight: 600,
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "var(--text-1)", cursor: "pointer",
                  }}
                >
                  Back to profile
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ALREADY QUALIFIED */}
        {phase === "already-qualified" && (
          <motion.div key="already-qualified"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16, padding: 24, textAlign: "center" }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(255,170,0,0.12)", border: "1px solid rgba(255,170,0,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 32px rgba(255,170,0,0.2)", marginBottom: 8,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#FFAA00" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.04em", color: "#FFAA00" }}>
              You&apos;re already Qualified
            </h2>
            <p style={{ fontSize: 17, color: "var(--text-2)", maxWidth: 320 }}>
              Your profile already displays the Qualified badge. No need to retake the assessment.
            </p>
            <button onClick={() => router.push("/profile")} className="btn-primary"
              style={{ padding: "12px 28px", borderRadius: 12, fontSize: 17 }}>
              View profile →
            </button>
          </motion.div>
        )}

        {/* ERROR */}
        {phase === "error" && (
          <motion.div key="error"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 14, padding: 24, textAlign: "center" }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 600, color: "#ff6666" }}>{errorMsg}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => router.push("/profile")}
                style={{ padding: "10px 20px", borderRadius: 10, fontSize: 16, cursor: "pointer", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-1)" }}>
                Go to profile
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes thinking {
          0%, 100% { opacity: 0.2; transform: translateY(0); }
          50% { opacity: 0.9; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
