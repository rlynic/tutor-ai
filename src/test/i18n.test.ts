/**
 * i18n 国际化测试
 * 覆盖：translations 完整性、fallback 行为、所有语言的关键 key
 * 注：使用纯函数 translate() 避免在测试中调用 React hook
 */
import { describe, it, expect } from 'vitest';
import { translate } from '../renderer/i18n';

const LANGUAGES = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'es-ES', 'fr-FR'] as const;

const REQUIRED_KEYS = [
  'app.subtitle',
  'btn.start', 'btn.stop', 'btn.graphic', 'btn.send',
  'dialog.welcome', 'dialog.label', 'dialog.placeholder_active', 'dialog.placeholder_inactive',
  'graphic.label', 'graphic.placeholder',
  'settings.title', 'settings.save', 'settings.saved',
  'settings.nav.ai', 'settings.nav.learning', 'settings.nav.interface', 'settings.nav.about',
  'settings.theme', 'settings.theme_light', 'settings.theme_dark',
  'settings.anim_speed', 'settings.anim_slow', 'settings.anim_normal', 'settings.anim_fast',
  'settings.language', 'settings.font_size_label', 'settings.font_size_small', 'settings.font_size_large',
  'settings.ai.title', 'settings.ai.provider', 'settings.ai.test', 'settings.ai.testing',
  'settings.ai.test_ok', 'settings.ai.test_fail', 'settings.ai.model', 'settings.ai.saved',
  'settings.interface.title',
  'settings.learning.title', 'settings.learning.grade', 'settings.learning.grade_unit',
  'settings.learning.max_turns', 'settings.learning.concise', 'settings.learning.detailed',
  'settings.learning.saved',
  'settings.about.title', 'settings.about.subtitle', 'settings.about.version',
  'settings.about.description', 'settings.about.tech_stack',
  'settings.about.danger', 'settings.about.clear', 'settings.about.clearing',
  'settings.about.clear_hint', 'settings.about.confirm_clear', 'settings.about.cleared',
  'sidebar.history',
  'completion.title', 'completion.new_question',
];

// ── key coverage per language ───────────────────────────────────

describe('所有语言包含必要 key', () => {
  for (const lang of LANGUAGES) {
    it(`${lang} 包含全部 ${REQUIRED_KEYS.length} 个必要 key`, () => {
      for (const key of REQUIRED_KEYS) {
        const val = translate(lang, key);
        // fallback 返回 key 本身 → 该语言缺少此翻译
        expect(val, `[${lang}] missing key: ${key}`).not.toBe(key);
        expect(val.length, `[${lang}] empty value for key: ${key}`).toBeGreaterThan(0);
      }
    });
  }
});

// ── dialog.welcome ───────────────────────────────────────────────

describe('dialog.welcome', () => {
  it('zh-CN 欢迎语包含"数学老师"', () => {
    expect(translate('zh-CN', 'dialog.welcome')).toContain('数学老师');
  });

  it('en-US welcome contains "tutor"', () => {
    expect(translate('en-US', 'dialog.welcome').toLowerCase()).toContain('tutor');
  });

  it('ja-JP 欢迎語に「先生」が含まれる', () => {
    expect(translate('ja-JP', 'dialog.welcome')).toContain('先生');
  });

  it('ko-KR 인사말에 "선생님" 포함', () => {
    expect(translate('ko-KR', 'dialog.welcome')).toContain('선생님');
  });
});

// ── template placeholder replacement ────────────────────────────

describe('settings.font_size_label {n} 占位符', () => {
  for (const lang of LANGUAGES) {
    it(`${lang}: {n} 被替换`, () => {
      const label = translate(lang, 'settings.font_size_label').replace('{n}', '16');
      expect(label).toContain('16');
      expect(label).not.toContain('{n}');
    });
  }
});

describe('settings.learning.max_turns {n} 占位符', () => {
  for (const lang of LANGUAGES) {
    it(`${lang}: {n} 被替换`, () => {
      const label = translate(lang, 'settings.learning.max_turns').replace('{n}', '5');
      expect(label).toContain('5');
      expect(label).not.toContain('{n}');
    });
  }
});

describe('settings.ai.test_ok {latency} 占位符', () => {
  for (const lang of LANGUAGES) {
    it(`${lang}: {latency} 被替换`, () => {
      const msg = translate(lang, 'settings.ai.test_ok').replace('{latency}', '99');
      expect(msg).toContain('99');
      expect(msg).not.toContain('{latency}');
    });
  }
});

// ── fallback behaviour ───────────────────────────────────────────

describe('fallback 行为', () => {
  it('未知 key 返回 key 本身', () => {
    expect(translate('zh-CN', 'nonexistent.key.xyz')).toBe('nonexistent.key.xyz');
  });

  it('en-US: btn.start 包含 "Start"', () => {
    expect(translate('en-US', 'btn.start')).toContain('Start');
  });

  it('zh-CN: btn.start 包含"开始"', () => {
    expect(translate('zh-CN', 'btn.start')).toContain('开始');
  });

  it('ja-JP: btn.start 包含"開始"', () => {
    expect(translate('ja-JP', 'btn.start')).toContain('開始');
  });

  it('未知语言 fallback 到 zh-CN', () => {
    expect(translate('xx-XX', 'btn.start')).toBe(translate('zh-CN', 'btn.start'));
  });
});

// ── language-specific spot checks ───────────────────────────────

describe('各语言主题/按钮词汇验证', () => {
  it('en-US: settings.theme_light 包含 "Light"', () => {
    expect(translate('en-US', 'settings.theme_light')).toContain('Light');
  });

  it('zh-CN: settings.theme_dark 包含"深色"', () => {
    expect(translate('zh-CN', 'settings.theme_dark')).toContain('深色');
  });

  it('en-US: settings.about.title 包含 "About"', () => {
    expect(translate('en-US', 'settings.about.title')).toContain('About');
  });

  it('en-US: settings.ai.title 包含 "AI"', () => {
    expect(translate('en-US', 'settings.ai.title')).toContain('AI');
  });

  it('zh-CN: settings.learning.grade_unit 为"年级"', () => {
    expect(translate('zh-CN', 'settings.learning.grade_unit')).toBe('年级');
  });
});
