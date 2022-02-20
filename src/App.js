import React, { useState, useEffect } from 'react'
import { parseCSS } from './js/parseCSS'
import { usePens } from './js/usePens'
import createPen from './js/createPen'
import PenCard from './components/PenCard'
import Tag from './components/Tag'
import Code from './components/Code'
import Button from './components/Button'

  // TODO:
  // - check here (in Editor component) if pen is valid?
  // - Usar reducer para unificar estados
  // - Placeholder loading

const DEFAULT_PEN_ID = 'heart'

export default function App () {
  const currentHash = () => window.location.hash.replace('#', '') || DEFAULT_PEN_ID
  const [penID, setPenID] = useState(currentHash())
  const {loadingPens, pens} = usePens()
  const [pen, setPen] = useState(false)
  const [step, setStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [stepInfo, setStepInfo] = useState()
  const [rawCode, setRawCode] = useState()
  const [parsedCode, setParsedCode] = useState()
  const [autoplay, setAutoplay] = useState()

  useEffect(() => {
    // Subscribe on hash changes
    const handlerHashChange = () => setPenID(currentHash())
    window.addEventListener('hashchange', handlerHashChange)

    // Close pen list menu when pen is selected
    handleClosePenList()

    return () => window.removeEventListener('hashchange', handlerHashChange)
  }, [penID])

  useEffect(() => {
    if(!loadingPens && pens){
      const newPen = createPen(penID, pens)

      if(!newPen) {
        console.log('useEffect [loadingPens, pens, id] - Pen not found')
        return false
      }

      setPen(newPen)
      setStep(0)
      setTotalSteps(newPen.steps.length)
      setStepInfo(newPen.steps[0].info)
      setRawCode(newPen.steps[0].code)
      setParsedCode(parseCSS(newPen.steps[0].code))
      setAutoplay(true)
    }
  }, [loadingPens, pens, penID])

  // When step changes
  useEffect(() => {
    if(!pen) return false

    const newStep = pen.steps[step]
    if(!newStep) return

    const newInfo = newStep?.info || `Step ${step + 1}`

    setRawCode(newStep.code)
    setParsedCode(parseCSS(newStep.code))
    setStepInfo(newInfo)
  }, [step])

  // Play
  useEffect(() => {
    if(autoplay) {
      const timeout = setTimeout(() => {
        if (step >= pen.steps.length - 1) {
          setAutoplay(false)
        } else {
          setStep(step => step + 1)
        }
      }, 1000)

      return () => {
        // useEffect callback return function
        clearTimeout(timeout)
      }
    }
  }, [autoplay, step, pen.steps])

  function handlePlayStop() {
    const newAutoplay = !autoplay
    setAutoplay(newAutoplay)
  }

  // Functions to check is can move to next or previous step
  const notNext = () => step + 1 >= totalSteps
  const notPrev = () => step <= 0

  function handleNext() {
    if (notNext()) return

    setAutoplay(false)
    setStep(step => step + 1)
  }

  function handlePrev() {
    if (notPrev()) return

    setAutoplay(false)
    setStep(step => step - 1)
  }

  // Mobile menu with the list of Pens
  function handleMore() {
    // TODO: use State, Context, ...
    document.querySelector('body').classList.add('show-pen-list')
  }

  const handleUpdateRawCode = setRawCode

  const handleClosePenList = () => {
    document.querySelector('body').classList.remove('show-pen-list')
  }

  if(loadingPens || !pen) {
    return <div className='Spinner' />
  }

  return (
    <div className='App'>
      <div className='PenList'>
        <button className='Button PenList__close' onClick={handleClosePenList}>Close</button>

        {pens.map((item) => <PenCard key={item.id} pen={item} active={penID} />)}
      </div>

      <div className='Editor' style={{background: pen.bg}}>
        <div className='Editor__code'>
          <div className='Editor__step-info'>{stepInfo}</div>

          <div className='Code'>
            <Code parsedCode={parsedCode} handleUpdateRawCode={handleUpdateRawCode} />

            <Tag html={`<style type="text/css">${rawCode}</style>`} />
          </div>

          <div className='Buttons Editor__buttons'>
            { totalSteps ?
              <>
                <Button label={autoplay ? 'Stop' : 'Play'} action={handlePlayStop} />
                <Button label={`${step + 1}/${totalSteps}`} disabled={true} />
                <Button label='<' action={handlePrev} disabled={notPrev()} />
                <Button label='>' action={handleNext} disabled={notNext()} />
              </>
              :
              <Button label='Fixed paint' disabled={true} />
            }
            <Button className='button--more' label='More!' action={handleMore} />
          </div>
        </div>

        <Tag html={pen.html} className='Editor__html' />
      </div>
    </div>
  )
}
