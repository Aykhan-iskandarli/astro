import {ReactNode} from 'react';

export interface ITerm {
    /** Key in content.glossary */
    id: string;
    children: ReactNode;
}
