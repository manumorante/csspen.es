import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useApiContext } from '../context/ApiContext'
import Style from '../components/Style'
import Html from '../components/Html'
import Code from '../components/Code'
import List from '../components/List'
import Controls from '../components/Controls'
import Progress from '../components/Progress'
import StepInfo from '../components/StepInfo'

export default function Pen() {
  const { slug } = useParams()
  const { state, dispatch } = useApiContext()

  // When url changed
  useEffect(() => {
    if (!state.loaded) return

    dispatch({ type: 'CLOSE_MENU' })
    dispatch({ type: 'SET_PEN', id: slug })
  }, [slug, state.loaded])

  // Play
  useEffect(() => {
    if (!state.loaded) return

    if (state.autoplay) {
      const timeout = setTimeout(() => {
        if (state.step >= state.pen.steps.length - 1) {
          dispatch({ type: 'STOP' })
        } else {
          dispatch({ type: 'NEXT' })
        }
      }, 1000)

      return () => clearTimeout(timeout)
    }
  }, [state.loaded, state.autoplay, state.step])

  if (!state.pen || Object.keys(state.pen).length === 0) return null

  return (
    <div className='h-full grid grid-rows-2 sm:grid-rows-1 sm:grid-cols-[200px_400px_auto] overflow-y-auto'>
      <div
        className={`md:block md:relative bg-neutral-900 ${
          !state.menuIsOpen && 'hidden'
        }`}>
        <div
          className={`Button absolute z-30 top-6 right-6 sm:hidden ${
            !state.menuIsOpen && 'hidden'
          }`}
          onClick={() => {
            dispatch({ type: 'CLOSE_MENU' })
          }}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </div>
        <List active={slug} />
      </div>

      <div className='p-6 sm:h-full overflow-y-auto bg-neutral-900'>
        <Controls state={state} dispatch={dispatch} />
        <StepInfo pen={state.pen} step={state.step} dispatch={dispatch} />
        <Code css={state.pen.steps[state.step].css} dispatch={dispatch} />
      </div>

      <div
        className='overflow-hidden sm:h-full relative'
        style={{ background: state.pen.colors.c3 }}>
        <Html
          html={state.pen.html}
          classes='grid place-items-center h-full transition-all-children'
        />
        <Progress pen={state.pen} step={state.step} />
        <Style css={state.pen.steps[state.step].css} />
      </div>
    </div>
  )
}
