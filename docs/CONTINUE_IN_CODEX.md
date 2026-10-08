# Стартовий промпт для Codex

Ти працюєш у розпакованій папці OpenPV. Спочатку прочитай AGENTS.md, README.md, docs/NEXT_AI_HANDOFF.md, docs/IMPLEMENTATION_REPORT.md та docs/spec/electrical-v0.1.md.

Це вже виконуваний starter. Не переписуй його з нуля й не називай placeholder/UNKNOWN готовою engineering feature. Перевір поточний стан командою pnpm check, потім запусти Designer Lite. Збережи структуру schema → core → CLI/UI та всі SPEC-01…10.

Продовж розвиток за handoff: exact manufacturer equipment, independently verified ampacity/derating, constraint solver, complete protection/SPD, localization, release packaging. Почни з інвентаризації вже реалізованого й тестів; склади конкретний план за файлами. Уточнюй лише необхідні параметри, яких немає в коді або datasheet.

Перший наступний результат: 2–3 реальні exact-SKU modules/inverters із sources, regression fixtures та повним відтворюваним flow. Нормативні правила UA/CZ перевіряй за первинними джерелами. Не приховуй відсутні дані, не копіюй приватні компоненти Solar Suite і не публікуй репозиторій до окремого рішення власника про ліцензію.
