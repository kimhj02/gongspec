export type CertificateGroup = '공통' | '행정·경영' | '데이터·전산' | '기술·설비'

export type CertificatePreset = {
  name: string
  issuer: string
  group: CertificateGroup
  level?: string
  scoreInput?: boolean
}

export const certificateLevelOptions = ['1급', '2급', '3급', '기사', '단일등급', '기타']

export const certificatePresets: CertificatePreset[] = [
  { name: '한국사능력검정시험', issuer: '국사편찬위원회', group: '공통' },
  { name: '컴퓨터활용능력', issuer: '대한상공회의소', group: '공통' },
  { name: '워드프로세서', issuer: '대한상공회의소', group: '공통' },
  { name: '토익 (TOEIC)', issuer: 'YBM', group: '공통', scoreInput: true },
  { name: '토익스피킹', issuer: 'YBM', group: '공통', scoreInput: true },
  { name: '오픽 (OPIC)', issuer: 'ACTFL', group: '공통', scoreInput: true },
  { name: '한국실용글쓰기검정', issuer: '(사)한국국어능력평가협회', group: '공통' },
  { name: 'KBS한국어능력시험', issuer: 'KBS', group: '공통' },
  { name: '사회조사분석사', issuer: '한국산업인력공단', group: '행정·경영' },
  { name: '행정사', issuer: '한국산업인력공단', group: '행정·경영', level: '단일등급' },
  { name: '직업상담사', issuer: '한국산업인력공단', group: '행정·경영' },
  { name: '비서', issuer: '대한상공회의소', group: '행정·경영' },
  { name: '사무자동화산업기사', issuer: '한국산업인력공단', group: '행정·경영', level: '단일등급' },
  { name: '전산회계', issuer: '한국세무사회', group: '행정·경영' },
  { name: '전산세무', issuer: '한국세무사회', group: '행정·경영' },
  { name: '전산회계운용사', issuer: '대한상공회의소', group: '행정·경영' },
  { name: '재경관리사', issuer: '삼일회계법인', group: '행정·경영', level: '단일등급' },
  { name: '회계관리', issuer: '삼일회계법인', group: '행정·경영' },
  { name: '물류관리사', issuer: '한국산업인력공단', group: '행정·경영', level: '단일등급' },
  { name: '유통관리사', issuer: '대한상공회의소', group: '행정·경영' },
  { name: '정보처리기사', issuer: '한국산업인력공단', group: '데이터·전산', level: '단일등급' },
  { name: '정보처리산업기사', issuer: '한국산업인력공단', group: '데이터·전산', level: '단일등급' },
  { name: '정보보안기사', issuer: '한국산업인력공단', group: '데이터·전산', level: '단일등급' },
  { name: '빅데이터분석기사', issuer: '한국데이터산업진흥원', group: '데이터·전산', level: '단일등급' },
  { name: 'ADsP', issuer: '한국데이터산업진흥원', group: '데이터·전산', level: '단일등급' },
  { name: 'DAsP', issuer: '한국데이터산업진흥원', group: '데이터·전산', level: '단일등급' },
  { name: 'SQLD', issuer: '한국데이터산업진흥원', group: '데이터·전산', level: '단일등급' },
  { name: '전기기사', issuer: '한국산업인력공단', group: '기술·설비', level: '단일등급' },
  { name: '토목기사', issuer: '한국산업인력공단', group: '기술·설비', level: '단일등급' },
  { name: '건축기사', issuer: '한국산업인력공단', group: '기술·설비', level: '단일등급' },
  { name: '일반기계기사', issuer: '한국산업인력공단', group: '기술·설비', level: '단일등급' },
  { name: '화공기사', issuer: '한국산업인력공단', group: '기술·설비', level: '단일등급' },
  { name: '측량및지형공간정보기사', issuer: '한국산업인력공단', group: '기술·설비', level: '단일등급' },
  { name: '산업안전기사', issuer: '한국산업인력공단', group: '기술·설비', level: '단일등급' },
  { name: '건설안전기사', issuer: '한국산업인력공단', group: '기술·설비', level: '단일등급' },
  { name: '소방설비기사', issuer: '한국산업인력공단', group: '기술·설비', level: '단일등급' },
  { name: '에너지관리기사', issuer: '한국산업인력공단', group: '기술·설비', level: '단일등급' },
  { name: '대기환경기사', issuer: '한국산업인력공단', group: '기술·설비', level: '단일등급' },
  { name: '수질환경기사', issuer: '한국산업인력공단', group: '기술·설비', level: '단일등급' },
]

export const certificateGroups: CertificateGroup[] = ['공통', '행정·경영', '데이터·전산', '기술·설비']

export function certificatePresetFor(name: string) {
  const value = name.trim()
  return certificatePresets.find((preset) => preset.name === value)
}

export function isLanguageCertificate(name = '') {
  const value = name.trim()
  if (certificatePresetFor(value)?.scoreInput) return true
  return /(토익|오픽|토플|아이엘츠|텝스|toeic|opic|toefl|ielts|teps)/i.test(value)
}

export function languageScorePlaceholder(name = '') {
  if (/오픽|opic/i.test(name)) return '예: IH'
  if (/토익스피킹|speaking/i.test(name)) return '예: 160'
  if (/토익|toeic/i.test(name)) return '예: 850'
  return '예: 점수 또는 등급'
}

export function applyCertificatePreset(preset: CertificatePreset) {
  return {
    credential: preset.name,
    issuer: preset.issuer,
    level: preset.level ?? '',
  }
}

export function applyCredentialName(name: string, current: Record<string, string> = {}) {
  const preset = certificatePresetFor(name)
  if (preset) return applyCertificatePreset(preset)
  if (certificatePresetFor(current.credential ?? '')) {
    return { credential: name, issuer: '', level: '' }
  }
  return { credential: name }
}
