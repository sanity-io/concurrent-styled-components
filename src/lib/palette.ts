function map(n: number, start1: number, end1: number, start2: number, end2: number) {
  return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2
}

function adjustHue(val: number) {
  if (val < 0) val += Math.ceil(-val / 360) * 360

  return val % 360
}

export function createHueShiftPalette(opts: {
  base: {
    l: number
    c: number
    h: number
    mode: 'lch'
  }
  minLightness: number
  maxLightness: number
  hueStep: number
}) {
  const {base, minLightness, maxLightness, hueStep} = opts

  const palette = [base]

  for (let i = 1; i < 5; i++) {
    const hueDark = adjustHue(base.h - hueStep * i)
    const hueLight = adjustHue(base.h + hueStep * i)
    const lightnessDark = map(i, 0, 4, base.l, minLightness)
    const lightnessLight = map(i, 0, 4, base.l, maxLightness)
    const chroma = base.c

    palette.push({
      l: lightnessDark,
      c: chroma,
      h: hueDark,
      mode: 'lch',
    })

    palette.unshift({
      l: lightnessLight,
      c: chroma,
      h: hueLight,
      mode: 'lch',
    })
  }

  return palette
}

export function generateHueShiftPalette() {
  return createHueShiftPalette({
    base: {
      l: 55,
      c: 75,
      h: Math.random() * 60,
      mode: 'lch',
    },
    minLightness: 25,
    maxLightness: 90,
    hueStep: 12,
  })
}
