import prisma from './prisma.js';
import { allCalls } from '../data/calls.js';

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sem I e O para evitar confusão visual
const DIGITS = '0123456789';
const TOTAL_CALLS = allCalls.length;

function generateCode() {
    const l = () => LETTERS[Math.floor(Math.random() * LETTERS.length)];
    const d = () => DIGITS[Math.floor(Math.random() * DIGITS.length)];
    return `${l()}${l()}${l()}${d()}${d()}${d()}`;
}

export async function generateUniqueCode() {
    for (let i = 0; i < 10; i++) {
        const code = generateCode();
        const exists = await prisma.session.findUnique({ where: { code } });
        if (!exists) return code;
    }
    throw new Error('Não foi possível gerar código único');
}

export function generateCallIndices(totalCalls) {
    const all = Array.from({ length: TOTAL_CALLS }, (_, i) => i);
    for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, totalCalls);
}
