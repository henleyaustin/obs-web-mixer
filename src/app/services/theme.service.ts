import {
    Inject,
    Injectable,
    Renderer2,
    RendererFactory2,
    signal
} from '@angular/core';
import { Themes } from '../../_models/Themes';
import { DOCUMENT } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private renderer: Renderer2;

    currentTheme = signal(Themes.DARK_THEME);

    constructor(
        @Inject(DOCUMENT) private document: Document,
        rendererFactory: RendererFactory2
    ) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }

    Initialize(): void {
        this.setTheme('dark-theme');
    }

    toggleTheme(): void {
        var newTheme = document.body.classList.contains('dark-theme')
            ? Themes.LIGHT_THEME
            : Themes.DARK_THEME;

        this.currentTheme.set(newTheme);

        this.setTheme(newTheme);
    }

    setTheme(theme: string): void {
        this.renderer.removeClass(document.body, 'dark-theme');
        this.renderer.removeClass(document.body, 'light-theme');
        this.renderer.addClass(document.body, theme);
    }
}
