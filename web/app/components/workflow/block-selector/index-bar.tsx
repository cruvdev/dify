import type { FC, RefObject } from 'react'
import classNames from '@/utils/classnames'

export const CUSTOM_GROUP_NAME = '@@@custom@@@'
export const WORKFLOW_GROUP_NAME = '@@@workflow@@@'
export const AGENT_GROUP_NAME = '@@@agent@@@'
/*
{
  A: {
    'google': [ // plugin organize name
      ...tools
    ],
    'custom': [ // custom tools
      ...tools
    ],
    'workflow': [ // workflow as tools
      ...tools
    ]
  }
}
*/

type IndexBarProps = {
  letters: string[]
  itemRefs: RefObject<{ [key: string]: HTMLElement | null }>
  className?: string
}

const IndexBar: FC<IndexBarProps> = ({ letters, itemRefs, className }) => {
  const handleIndexClick = (letter: string) => {
    const element = itemRefs.current?.[letter]
    if (element)
      element.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <div className={classNames('index-bar absolute right-0 top-36 flex flex-col items-center w-6 justify-center text-xs font-medium text-text-quaternary', className)}>
      <div className='absolute left-0 top-0 h-full w-px bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,rgba(16,24,40,0.08)_30%,rgba(16,24,40,0.08)_50%,rgba(16,24,40,0.08)_70.5%,rgba(255,255,255,0)_100%)]'></div>
      {letters.map(letter => (
        <div className="cursor-pointer hover:text-text-secondary" key={letter} onClick={() => handleIndexClick(letter)}>
          {letter}
        </div>
      ))}
    </div>
  )
}

export default IndexBar
