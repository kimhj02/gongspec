import { Archive, Award, BriefcaseBusiness, CalendarDays, ClipboardList, FileText, GraduationCap, Landmark, PenLine, Sparkles, Users } from 'lucide-react'
import type { NavId, ResourceTab } from '@/lib/api'

export const calendarNav = { id: 'calendar' as const, label: '캘린더', icon: CalendarDays }
export const recruitsNav = { id: 'recruits' as const, label: '채용 공고', icon: Landmark }
export const studyNav = { id: 'study' as const, label: '스터디', icon: Users }

export const resourceTabs: { id: ResourceTab; label: string; icon: typeof Archive }[] = [
  { id: 'certificate', label: '자격증', icon: Award },
  { id: 'education', label: '학교교육', icon: GraduationCap },
  { id: 'training', label: '직업교육', icon: ClipboardList },
  { id: 'career', label: '경력사항', icon: BriefcaseBusiness },
  { id: 'applications', label: '지원 현황', icon: FileText },
  { id: 'essays', label: '자기소개서', icon: PenLine },
  { id: 'memo', label: '메모', icon: Archive },
  { id: 'sites', label: '사이트', icon: Sparkles },
]

export const navItems: { id: NavId; label: string; icon: typeof Archive }[] = [calendarNav, recruitsNav, studyNav, ...resourceTabs]

export function tabLabel(id: string) {
  return navItems.find((tab) => tab.id === id)?.label ?? id
}

export const tabCopy: Record<
  NavId,
  { eyebrow: string; intro: string; emptyTitle: string; emptyDescription: string; createLabel: string; editLabel: string; countLabel: string }
> = {
  calendar: {
    eyebrow: 'SCHEDULE',
    intro: '날짜를 눌러 일정을 등록하고, 지원 현황의 서류·필기·면접도 한눈에 확인하세요.',
    emptyTitle: '',
    emptyDescription: '',
    createLabel: '일정 추가',
    editLabel: '일정 수정',
    countLabel: '일정',
  },
  recruits: {
    eyebrow: 'RECRUIT',
    intro: '공공기관에서 진행 중인 공고를 정규직·계약직·인턴으로 나눠 봅니다. 매일 오전 8시 10분, 오후 4시 10분에 새로 가져옵니다.',
    emptyTitle: '진행 중인 공고가 없어요',
    emptyDescription: '지금 불러오기로 공공기관 채용공고를 받아 보세요.',
    createLabel: '지금 불러오기',
    editLabel: '채용 공고',
    countLabel: '공고',
  },
  study: {
    eyebrow: 'STUDY',
    intro: '개인 자료와는 따로 모이는 공간입니다. 같은 기관을 준비하는 사람과 스터디를 모으고, 연락은 사이트 안 댓글로만 주세요.',
    emptyTitle: '모집글이 없어요',
    emptyDescription: '기관명과 목적을 적고 스터디 모집글을 올려 보세요.',
    createLabel: '모집글 쓰기',
    editLabel: '모집글 수정',
    countLabel: '모집글',
  },
  certificate: {
    eyebrow: 'CERTIFICATE',
    intro: '취득한 자격증과 발급기관, 유효기간을 한곳에 모아 두세요.',
    emptyTitle: '자격증이 없어요',
    emptyDescription: '자격증명, 발급기관, 취득일을 추가해 보세요.',
    createLabel: '자격증 추가',
    editLabel: '자격증 수정',
    countLabel: '자격증',
  },
  education: {
    eyebrow: 'EDUCATION',
    intro: '학교 수업에서 들은 과목과 성적, 내용을 기록해 두세요.',
    emptyTitle: '학교교육이 없어요',
    emptyDescription: '과목명과 학점, 성적, 수업 내용을 추가해 보세요.',
    createLabel: '교육 추가',
    editLabel: '교육 수정',
    countLabel: '교육',
  },
  training: {
    eyebrow: 'TRAINING',
    intro: '직업교육 과정과 이수 내용을 필요할 때 꺼내 보세요.',
    emptyTitle: '직업교육이 없어요',
    emptyDescription: '교육기관과 과목, 이수 내용을 추가해 보세요.',
    createLabel: '교육 추가',
    editLabel: '교육 수정',
    countLabel: '교육',
  },
  career: {
    eyebrow: 'CAREER',
    intro: '근무한 기관과 담당 업무, 경력을 정리해 두세요.',
    emptyTitle: '경력사항이 없어요',
    emptyDescription: '기관명과 근무기간, 담당업무를 추가해 보세요.',
    createLabel: '경력 추가',
    editLabel: '경력 수정',
    countLabel: '경력',
  },
  applications: {
    eyebrow: 'APPLICATION',
    intro: '서류, 필기, 면접은 날짜가 정해질 때마다 하나씩 추가하세요. 면접은 1차·2차·3차로 나눠 적을 수 있습니다.',
    emptyTitle: '지원 현황이 없어요',
    emptyDescription: '회사명과 공고명을 적고, 서류·필기·면접 중 지금 아는 전형만 작성해 보세요.',
    createLabel: '지원 현황 추가',
    editLabel: '지원 현황 수정',
    countLabel: '지원',
  },
  essays: {
    eyebrow: 'ESSAY',
    intro: '공고마다 자기소개서 항목을 나눠 작성하고, 필요할 때 꺼내 쓰세요.',
    emptyTitle: '자기소개서가 없어요',
    emptyDescription: '공고명, 자기소개서 항목, 자기소개서를 작성해 보세요.',
    createLabel: '자기소개서 추가',
    editLabel: '자기소개서 수정',
    countLabel: '공고',
  },
  memo: {
    eyebrow: 'MEMO',
    intro: '준비하다 떠오른 메모를 짧게 남겨 두고, 나중에 다시 보세요.',
    emptyTitle: '메모가 없어요',
    emptyDescription: '생각난 문장이나 자료를 짧게 남겨 보세요.',
    createLabel: '메모 추가',
    editLabel: '메모 수정',
    countLabel: '메모',
  },
  sites: {
    eyebrow: 'SITE',
    intro: '자주 쓰는 채용·학습 사이트 주소를 모아 두세요.',
    emptyTitle: '사이트가 없어요',
    emptyDescription: '자주 들어가는 사이트 주소와 설명을 추가해 보세요.',
    createLabel: '사이트 추가',
    editLabel: '사이트 수정',
    countLabel: '사이트',
  },
}
