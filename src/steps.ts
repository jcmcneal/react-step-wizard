import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import type { NormalizedStep } from './types.js';

/** Flatten arrays and fragments, discard conditional holes, never assume .props exists. */
export function normalizeSteps(children: ReactNode, indexBase: 0 | 1): NormalizedStep[] {
    const result: NormalizedStep[] = [];
    function visit(nodes: ReactNode, prefix = '') {
        Children.forEach(nodes, (node, position) => {
            if (node == null || typeof node === 'boolean') return;
            if (!isValidElement<Record<string, unknown>>(node)) {
                throw new TypeError('StepWizard children must be React elements, arrays, or fragments.');
            }
            if (node.type === Fragment) {
                visit(node.props.children as ReactNode, `${prefix}fragment:${node.key ?? position}/`);
                return;
            }
            const index = result.length;
            const hashKey = typeof node.props.hashKey === 'string' ? node.props.hashKey : `step${index + 1}`;
            const stepName = typeof node.props.stepName === 'string' ? node.props.stepName : `step${index + 1}`;
            const identity = node.key ?? node.props.stepName ?? node.props.hashKey ?? `position:${index}`;
            result.push({ element: node, descriptor: {
                key: `${prefix}${identity}`, index, step: index + indexBase,
                hashKey, stepName, props: node.props,
            } });
        });
    }
    visit(children);
    for (const property of ['stepName', 'hashKey', 'key'] as const) {
        const seen = new Set<string>();
        for (const { descriptor } of result) {
            if (seen.has(descriptor[property])) {
                throw new TypeError(`StepWizard requires unique ${property} values: "${descriptor[property]}".`);
            }
            seen.add(descriptor[property]);
        }
    }
    return result;
}

export function readHash(): string {
    if (typeof window === 'undefined') return '';
    const raw = window.location.hash.slice(1);
    try { return decodeURIComponent(raw); } catch { return raw; }
}

export function writeHash(hash: string, replace = false): void {
    if (typeof window === 'undefined' || readHash() === hash) return;
    const url = `${window.location.pathname}${window.location.search}#${encodeURIComponent(hash)}`;
    // pushState preserves Back/Forward without triggering a second guard/hashchange loop.
    window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
}
