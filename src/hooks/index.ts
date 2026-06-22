"use client";

import { useState, useEffect, useCallback } from "react";
import type { Contract, Service } from "@/types";

export function useService(slug: string | null) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/service?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setService(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  return { service, loading, error };
}

export function useContract(id: string | null) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!id) return;
    fetch(`/api/escrow?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setContract(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { contract, loading, error, refresh };
}

export function useAgentEval() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    reasoning: string;
    recommendation: string;
    partialPercent?: number;
  } | null>(null);

  async function evaluate(contractId: string, deliveryNote: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, deliveryNote }),
      });
      const data = await res.json();
      setResult(data.evaluation);
      return data.evaluation;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function approve(contractId: string) {
    const res = await fetch("/api/agent", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractId, action: "APPROVE" }),
    });
    return res.json();
  }

  async function dispute(contractId: string) {
    const res = await fetch("/api/agent", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractId, action: "DISPUTE" }),
    });
    return res.json();
  }

  return { loading, result, evaluate, approve, dispute };
}
