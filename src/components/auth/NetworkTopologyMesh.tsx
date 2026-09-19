"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  pulseSpeed: number;
  phase: number;
}

export function NetworkTopologyMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 800);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Generate network nodes
    const nodeCount = Math.floor((width * height) / 12000) + 18;
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 2,
        baseRadius: Math.random() * 2 + 2,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Packet animation particles
    const packets: {
      from: Node;
      to: Node;
      progress: number;
      speed: number;
    }[] = [];

    const isDark = theme === "dark";

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      if (isDark) {
        bgGrad.addColorStop(0, "#060913");
        bgGrad.addColorStop(0.5, "#0b1329");
        bgGrad.addColorStop(1, "#030611");
      } else {
        bgGrad.addColorStop(0, "#f8fafc");
        bgGrad.addColorStop(0.5, "#e0f2fe");
        bgGrad.addColorStop(1, "#f1f5f9");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Ambient circular glow
      const glowGrad = ctx.createRadialGradient(
        width * 0.4,
        height * 0.4,
        10,
        width * 0.4,
        height * 0.4,
        Math.min(width, height) * 0.7
      );
      if (isDark) {
        glowGrad.addColorStop(0, "rgba(37, 99, 235, 0.22)");
        glowGrad.addColorStop(0.6, "rgba(14, 165, 233, 0.08)");
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        glowGrad.addColorStop(0, "rgba(59, 130, 246, 0.20)");
        glowGrad.addColorStop(0.6, "rgba(186, 230, 253, 0.4)");
        glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      }
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Update & draw nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        node.phase += node.pulseSpeed;
        node.radius = node.baseRadius + Math.sin(node.phase) * 1.2;
      });

      // Draw connection lines
      const maxDistance = 140;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * (isDark ? 0.35 : 0.45);
            ctx.strokeStyle = isDark
              ? `rgba(56, 189, 248, ${alpha})`
              : `rgba(2, 132, 199, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

            // Randomly spawn data packet
            if (packets.length < 12 && Math.random() < 0.002) {
              packets.push({
                from: nodes[i],
                to: nodes[j],
                progress: 0,
                speed: Math.random() * 0.015 + 0.008,
              });
            }
          }
        }
      }

      // Draw data packet particles
      for (let k = packets.length - 1; k >= 0; k--) {
        const p = packets[k];
        p.progress += p.speed;

        if (p.progress >= 1) {
          packets.splice(k, 1);
          continue;
        }

        const px = p.from.x + (p.to.x - p.from.x) * p.progress;
        const py = p.from.y + (p.to.y - p.from.y) * p.progress;

        ctx.fillStyle = isDark ? "#38bdf8" : "#0284c7";
        ctx.shadowColor = isDark ? "#38bdf8" : "#38bdf8";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw nodes
      nodes.forEach((node) => {
        // Node outer ring
        ctx.strokeStyle = isDark
          ? "rgba(56, 189, 248, 0.4)"
          : "rgba(2, 132, 199, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2);
        ctx.stroke();

        // Node center
        ctx.fillStyle = isDark ? "#38bdf8" : "#0284c7";
        ctx.shadowColor = isDark ? "#38bdf8" : "#0284c7";
        ctx.shadowBlur = isDark ? 10 : 4;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
