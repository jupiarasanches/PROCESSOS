


export * from './diff';
export * from './insights';
export * from './dateFilters';

export function createPageUrl(pageName: string) {
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}
