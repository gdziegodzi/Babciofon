/**
 * Task handler widgetu Android - wersja z match_parent.
 *
 * Outer FlexWidget używa match_parent (RemoteViews wymaga, by korzeń
 * wypełnił dostępne miejsce - liczbowe wymiary są ignorowane przez
 * niektóre wersje launcherów). Dzieci mają wrap_content.
 *
 * Plus console.log w handlerze - jeśli widget nadal pusty, spojrzymy
 * w adb logcat na tag ReactNativeJS i zobaczymy co się dzieje.
 */
console.log('[BABCIOFON-WIDGET] file loaded');

const React = require('react');
const RNAW = require('react-native-android-widget');

console.log('[BABCIOFON-WIDGET] lib exports:', Object.keys(RNAW).join(','));

const { FlexWidget, TextWidget } = RNAW;

async function widgetTaskHandler(props) {
  console.log('[BABCIOFON-WIDGET] handler called, action=' +
    (props && props.widgetAction) +
    ', name=' + (props && props.widgetInfo && props.widgetInfo.widgetName));

  if (!props || !props.widgetInfo) return;
  if (props.widgetInfo.widgetName !== 'QuickCall') return;

  try {
    const root = React.createElement(
      FlexWidget,
      {
        clickAction: 'OPEN_URI',
        clickActionData: { uri: 'babciofon://start' },
        style: {
          height: 'match_parent',
          width: 'match_parent',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0B6FB8',
          padding: 16,
        },
      },
      React.createElement(TextWidget, {
        text: 'OTWORZ',
        style: {
          fontSize: 28,
          color: '#FFFFFF',
          fontWeight: '700',
        },
      }),
      React.createElement(TextWidget, {
        text: 'BABCIOFON',
        style: {
          fontSize: 28,
          color: '#FFFFFF',
          fontWeight: '700',
          marginTop: 8,
        },
      })
    );

    console.log('[BABCIOFON-WIDGET] calling renderWidget');
    props.renderWidget(root);
    console.log('[BABCIOFON-WIDGET] renderWidget returned');
  } catch (err) {
    console.log('[BABCIOFON-WIDGET] CRASH: ' + (err && err.message));
    console.log('[BABCIOFON-WIDGET] STACK: ' + (err && err.stack));
  }
}

console.log('[BABCIOFON-WIDGET] module.exports set');
module.exports = { widgetTaskHandler };