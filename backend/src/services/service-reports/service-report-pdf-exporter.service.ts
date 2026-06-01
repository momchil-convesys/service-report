import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { ServiceReportDto } from '../../models/service-report-cms.model';

type PdfDoc = PDFKit.PDFDocument;

const PAGE = {
  width: 595.28,
  height: 841.89,
  marginX: 42.52,
  topWithHeader: 90.71,
  bottom: 34,
};

const COLORS = {
  gray: '#e9ecef',
  darkGray: '#6c757d',
  border: '#e9ecef',
  noData: '#c8c8c8',
  black: '#000000',
};

const HEADER_TEXT = `Seat: BG-1000 Sofia, Angel Kanchev Str. 12, Ground Floor, Solunska
Tel +359 2 958 0710
Fax +359 2 958 0711 office@convesys.com
Hot Line: .................
E-mail: ...................`;

const ACTIVITY_LABELS = [
  ['repair', 'Repair'],
  ['commissioning', 'Commissioning'],
  ['maintenance', 'Maintenance'],
  ['exchange', 'Exchange'],
  ['update', 'Update'],
  ['training', 'Training'],
  ['other', 'Other'],
] as const;

function firstExistingPath(candidates: string[]): string | undefined {
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function resourcePath(...parts: string[]): string | undefined {
  const cmsCore = 'C:\\CMS backend dot net\\condition-monitoring-system\\Condition-monitoring-system.Core';
  const candidates = [
    path.join(cmsCore, ...parts),
    path.join('c:\\service-report\\backend\\cms-api-win-x64-09-04-2025-01 (4)', ...parts),
    path.join(process.cwd(), ...parts),
  ];
  return firstExistingPath(candidates);
}

function valueOrDash(value: unknown): string {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  return String(value);
}

function asDate(value: unknown): Date | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDate(value: unknown): string {
  const date = asDate(value);
  if (!date) {
    return valueOrDash(value);
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatTime(value: unknown): string {
  const date = asDate(value);
  if (!date) {
    return '';
  }
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function durationFromDates(start: unknown, end: unknown): number | undefined {
  const startDate = asDate(start);
  const endDate = asDate(end);
  if (!startDate || !endDate) {
    return undefined;
  }
  return Math.max(0, endDate.getTime() - startDate.getTime()) / 60000;
}

function minutesToLongHours(minutes?: number): string {
  if (!Number.isFinite(minutes)) {
    return '-';
  }
  const total = Math.max(0, Math.round(minutes || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours && mins) {
    return `${hours} h ${mins} min`;
  }
  if (hours) {
    return `${hours} h`;
  }
  return `${mins} min`;
}

function getNested(value: unknown, keys: string[]): unknown {
  let current = value as Record<string, unknown> | undefined;
  for (const key of keys) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    current = current[key] as Record<string, unknown> | undefined;
  }
  return current;
}

function persons(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(String).join('\n');
  }
  return valueOrDash(value);
}

function registerResources(doc: PdfDoc): void {
  const regularFont = resourcePath('Resources', 'Fonts', 'OpenSans-Regular.ttf');
  const boldFont = resourcePath('Resources', 'Fonts', 'OpenSans-SemiBold.ttf');

  if (regularFont) {
    doc.registerFont('open_sans', regularFont);
  }
  if (boldFont) {
    doc.registerFont('open_sans_bold', boldFont);
  }
}

function setFont(doc: PdfDoc, bold = false, size = 8, color = COLORS.black): void {
  const fontName = bold ? 'open_sans_bold' : 'open_sans';
  try {
    doc.font(fontName);
  } catch {
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');
  }
  doc.fontSize(size).fillColor(color);
}

function drawHeader(doc: PdfDoc): void {
  setFont(doc, false, 7);
  doc.text(HEADER_TEXT, PAGE.marginX, 27, { width: 260, lineGap: 1 });

  const logo = resourcePath('Resources', 'Images', 'convesys_logo.png');
  if (logo) {
    doc.image(logo, PAGE.width - PAGE.marginX - 130, 27, { height: 42.52 });
  } else {
    setFont(doc, true, 15);
    doc.text('CONVESYS', PAGE.width - PAGE.marginX - 130, 30, { width: 130, align: 'right' });
  }
}

function drawFooter(doc: PdfDoc): void {
  setFont(doc, false, 7);
  doc.text('Page 1 of 1', 0, PAGE.height - 28, { width: PAGE.width, align: 'center' });
}

function row(
  doc: PdfDoc,
  y: number,
  widths: number[],
  cells: string[],
  options: { height?: number; header?: boolean; bold?: boolean; align?: ('left' | 'center' | 'right')[] } = {},
): number {
  const height = options.height ?? (options.header ? 25.51 : 19.84);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0);
  let x = PAGE.marginX;

  if (options.header) {
    doc.rect(PAGE.marginX, y, totalWidth, height).fill(COLORS.gray);
  }

  for (let i = 0; i < widths.length; i++) {
    setFont(doc, options.bold || options.header, options.header ? 10 : 8);
    doc.text(cells[i] ?? '', x + 4, y + 5, {
      width: widths[i] - 8,
      height: height - 8,
      align: options.align?.[i] || 'left',
      ellipsis: false,
    });
    x += widths[i];
  }

  doc.moveTo(PAGE.marginX, y + height).lineTo(PAGE.marginX + totalWidth, y + height).lineWidth(0.5).strokeColor(COLORS.border).stroke();
  return y + height;
}

function padding(y: number, small = false): number {
  return y + (small ? 1.98 : 4.25);
}

function checkbox(doc: PdfDoc, x: number, y: number, label: string, checked: boolean, width: number): void {
  setFont(doc, false, 8);
  doc.text(label, x, y, { width, align: 'center' });
  const box = 8.5;
  const boxX = x + width / 2 - box / 2;
  const boxY = y + 15;
  doc.rect(boxX, boxY, box, box).lineWidth(0.5).strokeColor(COLORS.black).stroke();
  if (checked) {
    setFont(doc, true, 8);
    doc.text('X', boxX + 1.2, boxY - 1.2, { width: box, align: 'center' });
  }
}

function noData(doc: PdfDoc, y: number, width: number): void {
  setFont(doc, true, 12, COLORS.noData);
  doc.text('No data', PAGE.marginX, y + 8, { width, align: 'center' });
}

function getActivity(report: ServiceReportDto, key: string): boolean {
  return Boolean(report.typeActivity?.[key]);
}

function getTravelStart(travel: unknown): unknown {
  return getNested(travel, ['origin', 'timestamp']) || getNested(travel, ['departure', 'timestamp']) || getNested(travel, ['departureDateTime']);
}

function getTravelEnd(travel: unknown): unknown {
  return getNested(travel, ['destination', 'timestamp']) || getNested(travel, ['arrival', 'timestamp']) || getNested(travel, ['arrivalDateTime']);
}

function getWorkStart(work: unknown): unknown {
  return getNested(work, ['timeWorkStart', 'timestamp']) || getNested(work, ['startDateTime']);
}

function getWorkEnd(work: unknown): unknown {
  return getNested(work, ['timeWorkEnd', 'timestamp']) || getNested(work, ['endDateTime']);
}

export class ServiceReportPdfExporterService {
  static async exportReport(report: ServiceReportDto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true, info: { Title: 'Service Report' } });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      registerResources(doc);
      drawHeader(doc);

      const contentWidth = PAGE.width - PAGE.marginX * 2;
      const summaryWidths = [contentWidth * 0.375, contentWidth * 0.22, contentWidth * 0.18, contentWidth * 0.225];
      let y = PAGE.topWithHeader;

      y = row(doc, y, [contentWidth], [`Service Report № ${report.id ?? ''}`], { header: true });
      y = padding(y);
      y = row(doc, y, summaryWidths, ['Client', 'Plant', 'Country', 'Installed Power MWp']);
      y = row(doc, y, summaryWidths, [
        report.userClient?.name || '-',
        report.plant?.name || valueOrDash(report.plantName || report.plantId),
        String(report.plant?.country || report.country || '-'),
        valueOrDash(report.installedPowerMwp || report.installedPowerKw),
      ], { bold: true });

      y = padding(y);
      y = row(doc, y, summaryWidths, ['Mail', 'Inverter №:', 'String Box №:', 'Complain №:']);
      y = row(doc, y, summaryWidths, [
        report.user?.email || '-',
        `${report.device?.name || report.deviceName || '-'}, ${report.deviceId || '-'}`,
        valueOrDash(report.stringBoxNumber),
        valueOrDash(report.complaintNumber),
      ], { bold: true });

      y = padding(y);
      y = row(doc, y, summaryWidths, ['Address', 'Inverter Type:', 'String Box Type:', 'Contract №:']);
      y = row(doc, y, summaryWidths, [
        report.userClient?.address || '-',
        String(report.device?.type || report.inverterType || '-'),
        valueOrDash(report.stringBoxType),
        valueOrDash(report.contractNumber),
      ], { bold: true, height: 33 });

      y = padding(y);
      y = row(doc, y, summaryWidths, ['', 'Inverter S/N:', 'String Box S/N:', 'Warranty Status']);
      y = row(doc, y, summaryWidths, [
        '',
        String(report.device?.serialNumber || report.inverterSerialNumber || '-'),
        valueOrDash(report.stringBoxSerialNumber),
        valueOrDash(report.warrantyStatus),
      ], { bold: true });

      y = padding(y);
      y = row(doc, y, summaryWidths, ['', 'Other Equipment:', '', '']);
      y = row(doc, y, [summaryWidths[0], summaryWidths[1] + summaryWidths[2] + summaryWidths[3]], ['', valueOrDash(report.otherEquipment)], { bold: true, height: 28 });

      y = padding(y);
      y = row(doc, y, [contentWidth], ['Purpose of the Visit'], { header: true, height: 19.84 });
      y = padding(y);
      const checkWidth = contentWidth / ACTIVITY_LABELS.length;
      ACTIVITY_LABELS.forEach(([key, label], index) => checkbox(doc, PAGE.marginX + index * checkWidth, y, label, getActivity(report, key), checkWidth));
      y += 31;

      const travelWidths = [contentWidth * 0.15, contentWidth * 0.09, contentWidth * 0.07, contentWidth * 0.49, contentWidth * 0.2];
      y = padding(y);
      y = row(doc, y, travelWidths, ['Travelling', '', '', '', 'Persons Participated'], { header: true, height: 19.84 });
      y = padding(y);

      const travels = Array.isArray(report.travelling) ? report.travelling : [];
      let totalTravelMinutes = 0;
      let totalKm = 0;
      if (!travels.length) {
        noData(doc, y, contentWidth);
        y += 28;
      } else {
        for (const travel of travels) {
          const start = getTravelStart(travel);
          const end = getTravelEnd(travel);
          const minutes = Number(getNested(travel, ['duration'])) || durationFromDates(start, end) || 0;
          const km = Number(getNested(travel, ['distance']) || getNested(travel, ['distanceKm']) || 0);
          totalTravelMinutes += minutes;
          totalKm += km;
          y = row(doc, y, travelWidths, [
            `${formatDate(start)}\n${formatTime(start)}\n${formatTime(end)}`,
            minutesToLongHours(minutes),
            `${km.toFixed(0)} km`,
            `${valueOrDash(getNested(travel, ['origin', 'location']) || getNested(travel, ['origin']))} - ${valueOrDash(getNested(travel, ['destination', 'location']) || getNested(travel, ['destination']))}`,
            persons(getNested(travel, ['personsParticipated'])),
          ], { height: 44, align: ['center', 'right', 'right', 'left', 'left'] });
          y = padding(y);
        }
        y = row(doc, y, travelWidths, ['Total:', minutesToLongHours(totalTravelMinutes), `${totalKm.toFixed(0)} km`, '', ''], { bold: true, align: ['right', 'right', 'right', 'left', 'left'] });
      }

      y = padding(y);
      y = row(doc, y, travelWidths, ['Work Performed', '', '', '', 'Persons Participated'], { header: true, height: 19.84 });
      y = padding(y);

      const works = Array.isArray(report.works) ? report.works : [];
      let totalWorkMinutes = 0;
      if (!works.length) {
        noData(doc, y, contentWidth);
        y += 28;
      } else {
        for (const work of works) {
          const start = getWorkStart(work);
          const end = getWorkEnd(work);
          const minutes = Number(getNested(work, ['duration'])) || durationFromDates(start, end) || 0;
          totalWorkMinutes += minutes;
          y = row(doc, y, travelWidths, [
            `${formatDate(start)}\n${formatTime(start)}\n${formatTime(end)}`,
            minutesToLongHours(minutes),
            '',
            valueOrDash(getNested(work, ['workName']) || getNested(work, ['description'])),
            persons(getNested(work, ['personsWorkParticipated']) || getNested(work, ['personsParticipated'])),
          ], { height: 44, align: ['center', 'right', 'right', 'left', 'left'] });
          y = padding(y);
        }
        y = row(doc, y, travelWidths, ['Total:', minutesToLongHours(totalWorkMinutes), '', '', ''], { bold: true, align: ['right', 'right', 'left', 'left', 'left'] });
      }

      y = padding(y);
      const materialWidths = [contentWidth * 0.07, contentWidth * 0.48, contentWidth * 0.15, contentWidth * 0.15, contentWidth * 0.15];
      y = row(doc, y, materialWidths, ['Materials / Spare Parts', '', 'Dismantled\nItem S/N', 'Installed\nItem №', 'Installed\nItem S/N'], { header: true, height: 25.51 });
      y = padding(y);

      const materials = Array.isArray(report.materials) ? report.materials : [];
      if (!materials.length) {
        noData(doc, y, contentWidth);
        y += 28;
      } else {
        for (const material of materials) {
          y = row(doc, y, materialWidths, [
            getNested(material, ['quantity']) ? `${getNested(material, ['quantity'])} x` : '',
            valueOrDash(getNested(material, ['name']) || getNested(material, ['material'])),
            valueOrDash(getNested(material, ['dismantledSerialNumber'])),
            valueOrDash(getNested(material, ['itemNumber'])),
            valueOrDash(getNested(material, ['installedSerialNumber'])),
          ], { height: 24, align: ['right', 'left', 'left', 'left', 'left'] });
          y = padding(y, true);
        }
      }

      drawFooter(doc);
      doc.end();
    });
  }
}
