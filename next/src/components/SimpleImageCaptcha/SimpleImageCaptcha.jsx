'use client';

import React, { useCallback, useEffect, useRef } from 'react';

const CAPTCHA_WIDTH = 80;
const CAPTCHA_HEIGHT = 36;

/**
 * Draws a simple image captcha: 2 uppercase letters on a noisy dark background.
 * Parent owns the code and validates the user input.
 *
 * @param {string} code - Two uppercase letters (e.g. "GR")
 * @param {string} value - Current user input value
 * @param {(v: string) => void} onChange - Called when user types (e.g. limit to 2 chars)
 * @param {string} [placeholder] - Input placeholder
 * @param {string} [className] - Wrapper class
 * @param {string} [imageClassName] - Canvas/image wrapper class
 * @param {string} [inputClassName] - Input class
 * @param {number} [width] - Canvas width
 * @param {number} [height] - Canvas height
 * @param {number} [inputWidth] - Input width in px (applied as inline style so it always wins)
 * @param {boolean} [stacked] - If true, image on first line (full-width row), input on second line (full-width)
 * @param {boolean} [imageOnly] - If true, only render the image (no input); use with stacked when parent renders custom input
 */
function SimpleImageCaptcha({
  code,
  value,
  onChange,
  placeholder = '',
  className = '',
  imageClassName = '',
  inputClassName = '',
  width = CAPTCHA_WIDTH,
  height = CAPTCHA_HEIGHT,
  inputWidth,
  stacked = false,
  imageOnly = false,
}) {
  const canvasRef = useRef(null);

  const drawCaptcha = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !code || code.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Noise: random dots (white/grey, low opacity)
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + Math.random() * 0.15})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 1.5 + 0.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Noise: short random lines
    for (let i = 0; i < 12; i++) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 + Math.random() * 0.1})`;
      ctx.lineWidth = 0.5 + Math.random() * 0.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(
        Math.random() * width,
        Math.random() * height,
      );
      ctx.stroke();
    }

    // Two letters: white/light grey, bold, slightly distorted
    ctx.fillStyle = '#e0e0e0';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textBaseline = 'middle';

    const letterSpacing = width / 3;
    const baseX = width * 0.22;
    const baseY = height / 2;

    for (let i = 0; i < 2; i++) {
      const letter = code[i] || '';
      const x = baseX + i * letterSpacing + (Math.random() - 0.5) * 4;
      const y = baseY + (Math.random() - 0.5) * 3;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.15);
      ctx.fillText(letter, 0, 0);
      ctx.restore();
    }
  }, [code, width, height]);

  useEffect(() => {
    drawCaptcha();
  }, [drawCaptcha]);

  const handleInputChange = useCallback(
    (e) => {
      const v = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2);
      onChange(v);
    },
    [onChange],
  );

  return (
    <div
      className={
        stacked
          ? `flex w-full flex-col gap-2 ${className}`
          : `flex items-center gap-1.5 ${className}`
      }
    >
      <div
        className={
          stacked
            ? `flex w-full justify-center overflow-hidden rounded-[5px] border border-[#FFFFFF33] bg-[#0a0a0a] ${imageClassName}`
            : `flex shrink-0 overflow-hidden rounded-[5px] border border-[#FFFFFF33] bg-[#0a0a0a] ${imageClassName}`
        }
        style={stacked ? { height: `${height}px` } : { width: `${width}px`, height: `${height}px` }}
      >
        {stacked ? (
          <div style={{ width: `${width}px`, height: `${height}px` }}>
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="block h-full w-full"
              aria-label="Captcha image"
            />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="block h-full w-full"
            aria-label="Captcha image"
          />
        )}
      </div>
      {!imageOnly && (
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          maxLength={2}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={
            inputClassName
              ? `text-center uppercase tracking-wider focus:outline-none ${inputClassName}`
              : ' rounded-[5px] border border-[#FFFFFF33] bg-[#1A1A1A] px-2 text-center text-sm uppercase tracking-wider text-white placeholder:text-white/50 focus:border-[#E8D25E] focus:outline-none'
          }
          style={
            stacked
              ? undefined
              : inputWidth != null
                ? { width: `${inputWidth}px`, minWidth: `${inputWidth}px` }
                : undefined
          }
          aria-label="Captcha answer"
        />
      )}
    </div>
  );
}

export default React.memo(SimpleImageCaptcha);

/** Generate a random 2-letter uppercase code for use with SimpleImageCaptcha. */
export function generateCaptchaCode() {
  const a = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const b = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return a + b;
}
