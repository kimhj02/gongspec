import { describe, expect, it } from 'vitest'
import { applyCertificatePreset, certificatePresetFor, certificatePresets } from './certificates'

describe('certificate presets', () => {
  it('fills the issuer for a known certificate', () => {
    expect(certificatePresetFor('오픽 (OPIC)')).toEqual(
      expect.objectContaining({ issuer: '멀티캠퍼스' }),
    )
    expect(applyCertificatePreset(certificatePresetFor('한국실용글쓰기검정')!)).toEqual({
      credential: '한국실용글쓰기검정',
      issuer: '(사)한국국어능력평가협회',
      level: '',
    })
    expect(applyCertificatePreset(certificatePresetFor('정보처리기사')!)).toEqual({
      credential: '정보처리기사',
      issuer: '한국산업인력공단',
      level: '단일등급',
    })
  })

  it('keeps every listed certificate unique', () => {
    const names = certificatePresets.map((preset) => preset.name)
    expect(new Set(names).size).toBe(names.length)
  })
})
