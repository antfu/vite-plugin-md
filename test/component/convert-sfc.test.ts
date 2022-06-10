import { describe, expect, it } from 'vitest'
import { composeFixture } from '../utils';
import { DefineComponent } from 'vue';
import { Frontmatter } from '../../src/types';

describe("converting SFC's to Components",  () => {
    
    it('import a simple markdown with import', async() => {
        const sfc = await import("../fixtures/with-slots.md") as { 
            default: DefineComponent, 
            frontmatter: Frontmatter 
        }
        const defn = await composeFixture('with-slots')

        expect(sfc.frontmatter.title).toBe('Testing Slots')
        expect(sfc.default.__name).toBe('with-slots')
        expect(sfc.default.props.name).toBeDefined()
        expect(sfc.default.props.name.type).toBeDefined()
    });
})