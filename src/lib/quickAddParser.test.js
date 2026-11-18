import { describe, it, expect } from 'vitest'
import { parseQuickAdd, parseDayToken } from './quickAddParser.js'

describe('parseDayToken', () => {
  it('parses compact combos', () => {
    expect(parseDayToken('MWF')).toEqual(['Mon', 'Wed', 'Fri'])
    expect(parseDayToken('TTh')).toEqual(['Tue', 'Thu'])
    expect(parseDayToken('MW')).toEqual(['Mon', 'Wed'])
    expect(parseDayToken('TThF')).toEqual(['Tue', 'Thu', 'Fri'])
  })
  it('parses individual days and abbreviations', () => {
    expect(parseDayToken('Mon')).toEqual(['Mon'])
    expect(parseDayToken('Tues')).toEqual(['Tue'])
    expect(parseDayToken('Thur')).toEqual(['Thu'])
    expect(parseDayToken('F')).toEqual(['Fri'])
  })
  it('T vs Th ambiguity', () => {
    expect(parseDayToken('T')).toEqual(['Tue'])
    expect(parseDayToken('Th')).toEqual(['Thu'])
    expect(parseDayToken('TTh')).toEqual(['Tue', 'Thu'])
  })
  it('dedupes and sorts not required at token level', () => {
    expect(parseDayToken('MM')).toEqual(['Mon'])
  })
  it('returns null for invalid', () => {
    expect(parseDayToken('X')).toBeNull()
    expect(parseDayToken('123')).toBeNull()
    expect(parseDayToken('')).toBeNull()
  })
})

describe('parseQuickAdd', () => {
  const cases = [
    ['Math 201 MWF 8-9:30 R204', 'Math 201', ['Mon', 'Wed', 'Fri'], '08:00', '09:30', 'Room 204'],
    ['Physics 101 Tue Thu 10:00-11:30 Room 302', 'Physics 101', ['Tue', 'Thu'], '10:00', '11:30', 'Room 302'],
    ['Programming TTh 1pm-3pm Lab 1', 'Programming', ['Tue', 'Thu'], '13:00', '15:00', 'Lab 1'],
    ['English 101 Mon Wed 2:00pm-3:30pm Room 204', 'English 101', ['Mon', 'Wed'], '14:00', '15:30', 'Room 204'],
    ['Database Systems Friday 8:00-10:00 Lab 2', 'Database Systems', ['Fri'], '08:00', '10:00', 'Lab 2'],
  ]
  for (const [input, name, days, start, end, room] of cases) {
    it(`parses: ${input}`, () => {
      const r = parseQuickAdd(input)
      expect(r.success).toBe(true)
      expect(r.data.name).toBe(name)
      expect(r.data.meetings[0].days).toEqual(days)
      expect(r.data.meetings[0].start).toBe(start)
      expect(r.data.meetings[0].end).toBe(end)
      expect(r.data.meetings[0].room).toBe(room)
    })
  }

  it('normalizes 24h time', () => {
    const r = parseQuickAdd('Math MWF 08:00-09:30')
    expect(r.success).toBe(true)
    expect(r.data.meetings[0].start).toBe('08:00')
    expect(r.data.meetings[0].end).toBe('09:30')
  })

  it('dedupes days and sorts Mon-Sun', () => {
    const r = parseQuickAdd('X Mon Wed Mon Fri 8-9')
    expect(r.data.meetings[0].days).toEqual(['Mon', 'Wed', 'Fri'])
  })

  it('handles missing room', () => {
    const r = parseQuickAdd('Math MWF 8-9')
    expect(r.success).toBe(true)
    expect(r.data.meetings[0].room).toBe('')
  })

  it('rejects empty input', () => {
    const r = parseQuickAdd('')
    expect(r.success).toBe(false)
    expect(r.errors.length).toBeGreaterThan(0)
  })

  it('rejects missing time', () => {
    const r = parseQuickAdd('Math MWF')
    expect(r.success).toBe(false)
    expect(r.errors.join(' ')).toMatch(/time range/i)
  })

  it('rejects missing days', () => {
    const r = parseQuickAdd('Math 8-9')
    expect(r.success).toBe(false)
    expect(r.errors.join(' ')).toMatch(/day/i)
  })

  it('rejects missing subject name', () => {
    const r = parseQuickAdd('MWF 8-9')
    expect(r.success).toBe(false)
    expect(r.errors.join(' ')).toMatch(/subject name/i)
  })

  it('rejects end <= start', () => {
    const r = parseQuickAdd('Math MWF 9-8')
    expect(r.success).toBe(false)
  })

  it('rejects invalid time', () => {
    const r = parseQuickAdd('Math MWF 25:00-26:00')
    expect(r.success).toBe(false)
  })

  it('handles ambiguous am/pm with warning or error', () => {
    const r = parseQuickAdd('Math MWF 10:00-11:30')
    // no meridiem -> 24h, valid
    expect(r.success).toBe(true)
  })

  it('preserves original input not mutated (pure)', () => {
    const input = 'Math MWF 8-9 R204'
    parseQuickAdd(input)
    expect(input).toBe('Math MWF 8-9 R204')
  })

  it('subject name with numbers preserved', () => {
    const r = parseQuickAdd('CS 101 MWF 8-9')
    expect(r.data.name).toBe('CS 101')
  })

  it('handles extra spaces and capitalization', () => {
    const r = parseQuickAdd('  math 201   mwf   8-9:30   r204  ')
    expect(r.success).toBe(true)
    expect(r.data.name).toBe('math 201')
  })

  it('room Laboratory normalized to Lab', () => {
    const r = parseQuickAdd('X M 8-9 Laboratory 2')
    expect(r.data.meetings[0].room).toBe('Lab 2')
  })

  it('long subject name', () => {
    const r = parseQuickAdd('Very Long Subject Name Here MWF 8-9')
    expect(r.success).toBe(true)
    expect(r.data.name).toBe('Very Long Subject Name Here')
  })

  it('invalid day abbreviation returns error', () => {
    const r = parseQuickAdd('Math Funday 8-9')
    // 'Funday' not a day token, becomes part of name; no days -> error
    expect(r.success).toBe(false)
  })

  // Regression: subject/day ambiguity
  it('preserves weekday words in subject name when day token follows', () => {
    const r = parseQuickAdd('Wednesday Club MWF 8-9')
    expect(r.success).toBe(true)
    expect(r.data.name).toBe('Wednesday Club')
    expect(r.data.meetings[0].days).toEqual(['Mon', 'Wed', 'Fri'])
  })

  it('recognizes weekday token after subject name', () => {
    const r = parseQuickAdd('Math Monday 8-9')
    expect(r.success).toBe(true)
    expect(r.data.name).toBe('Math')
    expect(r.data.meetings[0].days).toEqual(['Mon'])
  })

  it('keeps compact combos working', () => {
    const r = parseQuickAdd('X TTh 8-9')
    expect(r.success).toBe(true)
    expect(r.data.meetings[0].days).toEqual(['Tue', 'Thu'])
  })

  it('warns when subject/day boundary is ambiguous', () => {
    const r = parseQuickAdd('Monday 8-9')
    expect(r.success).toBe(false)
    expect(r.warnings.join(' ')).toMatch(/could not distinguish|subject name/i)
  })

  it('warns when boundary is ambiguous (days before subject)', () => {
    const r = parseQuickAdd('MWF Math 8-9')
    expect(r.success).toBe(false)
    expect(r.warnings.join(' ')).toMatch(/Could not distinguish/i)
  })

  // Regression: room extraction
  it('extracts R204', () => {
    expect(parseQuickAdd('X M 8-9 R204').data.meetings[0].room).toBe('Room 204')
  })
  it('extracts Room 204 and Room 302', () => {
    expect(parseQuickAdd('X M 8-9 Room 204').data.meetings[0].room).toBe('Room 204')
    expect(parseQuickAdd('X M 8-9 Room 302').data.meetings[0].room).toBe('Room 302')
  })
  it('extracts Lab 1 and Laboratory 2', () => {
    expect(parseQuickAdd('X M 8-9 Lab 1').data.meetings[0].room).toBe('Lab 1')
    expect(parseQuickAdd('X M 8-9 Laboratory 2').data.meetings[0].room).toBe('Lab 2')
  })
  it('does not consume subject words as room', () => {
    const r = parseQuickAdd('Lab Safety MWF 8-9')
    expect(r.success).toBe(true)
    expect(r.data.name).toBe('Lab Safety')
    expect(r.data.meetings[0].room).toBe('')
  })
  it('warns on unrecognized trailing text', () => {
    const r = parseQuickAdd('Math MWF 8-9 extra')
    expect(r.success).toBe(true)
    expect(r.warnings.join(' ')).toMatch(/Unrecognized text/i)
  })

  // Regression: AM/PM ambiguity
  it('rejects impossible times', () => {
    const r = parseQuickAdd('Math MWF 25:00-26:00')
    expect(r.success).toBe(false)
  })
  it('rejects invalid minutes', () => {
    const r = parseQuickAdd('Math MWF 8:60-9:00')
    expect(r.success).toBe(false)
  })
  it('handles mixed am/pm with warning', () => {
    const r = parseQuickAdd('Math MWF 10:00am-11:30')
    expect(r.success).toBe(true)
    expect(r.warnings.length).toBeGreaterThan(0)
  })
  it('preserves 12-hour inputs', () => {
    const r = parseQuickAdd('Math MWF 1pm-3pm')
    expect(r.success).toBe(true)
    expect(r.data.meetings[0].start).toBe('13:00')
    expect(r.data.meetings[0].end).toBe('15:00')
  })
  it('preserves 24-hour inputs', () => {
    const r = parseQuickAdd('Math MWF 13:00-14:00')
    expect(r.success).toBe(true)
    expect(r.data.meetings[0].start).toBe('13:00')
    expect(r.data.meetings[0].end).toBe('14:00')
  })
})
