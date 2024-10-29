import { Global } from '@emotion/react'
import React from 'react'

const Fonts = (): React.JSX.Element => (
  <Global
    styles={`
            @font-face {
                font-family: 'DecimaMono';
                src: url('./fonts/decima-mono.eot');
                src: url('./fonts/decima-mono.eot?#iefix') format('embedded-opentype'),
                         url('./fonts/decima-mono.woff2') format('woff2'),
                     url('./fonts/decima-mono.woff') format('woff'),
                     url('./fonts/decima-mono.ttf') format('truetype'),
                     url('./fonts/decima-mono.svg#youworkforthem') format('svg');
                font-weight: normal;
                font-style: normal;
            }

      `}
  />
)

export default Fonts
