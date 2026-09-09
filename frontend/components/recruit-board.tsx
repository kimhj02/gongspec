'use client'

import type { PublicRecruit } from '@/lib/api'
import { recruitDday, recruitPeriodCompact, sortRecruitsByDeadline } from '@/lib/recruits'

export default function RecruitBoard({ items }: { items: PublicRecruit[] }) {
  const rows = sortRecruitsByDeadline(items)

  return (
    <div className="recruit-table-wrap">
      <table className="recruit-table">
        <thead>
          <tr>
            <th>공고명</th>
            <th>접수기간</th>
            <th>채용구분</th>
            <th>채용인원</th>
            <th>D-DAY</th>
            <th>채용공고 원본 주소</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => {
            const dday = recruitDday(item.pbancEndYmd)
            return (
              <tr key={item.id}>
                <td>
                  <strong>{item.title || '-'}</strong>
                  {item.instNm ? <span className="recruit-inst">{item.instNm}</span> : null}
                </td>
                <td>{recruitPeriodCompact(item.pbancBgngYmd, item.pbancEndYmd)}</td>
                <td>{item.recrutSeNm || '-'}</td>
                <td>{item.recrutNope != null ? `${item.recrutNope}명` : '-'}</td>
                <td>
                  {dday ? (
                    <b className={`recruit-dday${ddayUrgent(dday) ? ' is-urgent' : ''}`}>{dday}</b>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  {item.srcUrl ? (
                    <a className="recruit-link" href={item.srcUrl} target="_blank" rel="noopener noreferrer">
                      {item.srcUrl}
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ddayUrgent(label: string) {
  if (label === 'D-Day') return true
  const days = Number(label.replace(/^D-/, ''))
  return label.startsWith('D-') && days >= 0 && days <= 3
}
