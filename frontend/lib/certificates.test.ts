import { describe, expect, it } from 'vitest'
import { applyCertificatePreset, applyCredentialName, certificatePresetFor, certificatePresets, isLanguageCertificate } from './certificates'

describe('certificate presets', () => {
  it('fills the issuer for a known certificate', () => {
    expect(certificatePresetFor('오픽 (OPIC)')).toEqual(
      expect.objectContaining({ issuer: 'ACTFL' }),
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
    expect(applyCertificatePreset(certificatePresetFor('오픽 (OPIC)')!)).toEqual({
      credential: '오픽 (OPIC)',
      issuer: 'ACTFL',
      level: '',
    })
  })

  it('clears preset issuer and grade when the name becomes custom', () => {
    expect(
      applyCredentialName('나만의자격', {
        credential: '정보처리기사',
        issuer: '한국산업인력공단',
        level: '단일등급',
      }),
    ).toEqual({ credential: '나만의자격', issuer: '', level: '' })
    expect(applyCredentialName('나만의자격', { credential: '나만의자격', issuer: '직접입력기관' })).toEqual({
      credential: '나만의자격',
    })
  })

  it('treats speaking tests as score inputs', () => {
    expect(isLanguageCertificate('오픽 (OPIC)')).toBe(true)
    expect(isLanguageCertificate('토익 (TOEIC)')).toBe(true)
    expect(isLanguageCertificate('정보처리기사')).toBe(false)
  })

  it('keeps every listed certificate unique', () => {
    const names = certificatePresets.map((preset) => preset.name)
    expect(new Set(names).size).toBe(names.length)
  })
})
