import BreadMascot from './BreadMascot'

function PagePeek() {
  return (
    <BreadMascot
      basket={false}
      className="absolute bottom-full right-7 sm:right-9 w-[86px] h-[41px] sm:w-[132px] sm:h-[63px] pointer-events-none"
    />
  )
}

export default PagePeek
