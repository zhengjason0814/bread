import Card from '../ui/Card'
import Skeleton, { LoadingRegion, SkeletonCircle, SkeletonLine } from '../ui/Skeleton'

const BAR_HEIGHTS = ['h-[38%]', 'h-[62%]', 'h-[47%]', 'h-[80%]', 'h-[55%]', 'h-[92%]']

function times(count) {
  return Array.from({ length: count }, (_, index) => index)
}

function StatBlock({ valueClassName = 'w-36 h-8' }) {
  return (
    <div className="flex flex-col gap-2">
      <SkeletonLine className="w-24 h-2.5" />
      <Skeleton className={valueClassName} />
    </div>
  )
}

function RowLines({ count }) {
  return (
    <div className="flex flex-col gap-3">
      {times(count).map((index) => (
        <div key={index} className="flex items-center gap-3">
          <SkeletonLine className="flex-1" />
          <SkeletonLine className="w-14" />
        </div>
      ))}
    </div>
  )
}

function TileSkeleton({ rows = 3 }) {
  return (
    <Card className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <SkeletonLine className="w-28 h-4" />
        <SkeletonLine className="w-20 ml-auto" />
      </div>
      <RowLines count={rows} />
    </Card>
  )
}

function TableSkeleton({ rows = 8, columns = 4 }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-4 pb-2 border-b border-rule">
        {times(columns).map((index) => (
          <SkeletonLine key={index} className="flex-1 h-2.5" />
        ))}
      </div>
      {times(rows).map((row) => (
        <div key={row} className="flex items-center gap-4">
          {times(columns).map((column) => (
            <SkeletonLine key={column} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ListRowsSkeleton({ rows = 6 }) {
  return (
    <LoadingRegion className="flex flex-col">
      {times(rows).map((index) => (
        <div
          key={index}
          className="flex flex-wrap items-center gap-x-3.5 gap-y-1 py-[17px] border-b border-rule-soft"
        >
          <SkeletonLine className="w-full sm:w-[190px]" />
          <SkeletonLine className="flex-1 min-w-0" />
          <SkeletonLine className="w-16" />
        </div>
      ))}
    </LoadingRegion>
  )
}

export function DashboardSkeleton() {
  return (
    <LoadingRegion className="flex flex-col gap-6">
      <div className="flex items-center gap-x-[26px] gap-y-4 px-2.5 pt-1.5 pb-[22px] flex-wrap">
        <SkeletonCircle className="w-[110px] h-[110px] sm:w-[170px] sm:h-[170px] flex-none" />
        <div className="flex-1 min-w-0 sm:flex-none sm:w-[300px] bg-card rounded-tile px-5 py-4 shadow-card flex flex-col gap-2.5">
          <SkeletonLine className="w-2/5 h-4" />
          <SkeletonLine className="w-4/5" />
        </div>
        <div className="w-full lg:w-auto lg:ml-auto flex flex-wrap gap-x-11 gap-y-4 pr-2.5">
          <StatBlock valueClassName="w-44 h-10" />
          <StatBlock valueClassName="w-32 h-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(320px,0.8fr)_1.2fr] gap-5 pb-6 border-b border-rule items-stretch">
        <Card className="flex flex-col gap-3.5">
          <SkeletonLine className="w-44 h-4" />
          <div className="flex flex-col sm:flex-row items-center gap-[22px]">
            <SkeletonCircle className="w-[158px] h-[158px] flex-none" />
            <div className="w-full sm:flex-1 flex flex-col gap-2.5">
              {times(5).map((index) => (
                <div key={index} className="flex items-center gap-2">
                  <SkeletonCircle className="w-[11px] h-[11px] flex-none" />
                  <SkeletonLine className="flex-1" />
                  <SkeletonLine className="w-8" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="relative min-h-[360px] xl:min-h-[240px]">
          <Card className="absolute inset-0 flex flex-col gap-3.5">
            <div className="flex items-center gap-3">
              <SkeletonLine className="w-48 h-4" />
              <Skeleton radius="rounded-full" className="w-36 h-9 ml-auto" />
            </div>
            <TableSkeleton rows={5} columns={4} />
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
        {times(6).map((index) => (
          <TileSkeleton key={index} rows={index === 1 ? 4 : 3} />
        ))}
      </div>
    </LoadingRegion>
  )
}

export function ChartsSkeleton() {
  return (
    <LoadingRegion className="flex flex-col gap-4">
      <SkeletonLine className="w-40 self-start" />

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <SkeletonLine className="w-56 h-5" />
          <div className="ml-auto flex gap-2">
            <SkeletonCircle className="w-9 h-9" />
            <SkeletonCircle className="w-9 h-9" />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-7">
          <SkeletonCircle className="w-[264px] h-[264px] flex-none" />
          <div className="w-full lg:flex-1 flex flex-col gap-3.5">
            {times(6).map((index) => (
              <div key={index} className="flex items-center gap-2.5">
                <SkeletonCircle className="w-3 h-3 flex-none" />
                <SkeletonLine className="flex-1" />
                <SkeletonLine className="w-16" />
                <SkeletonLine className="w-8" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <SkeletonLine className="w-44 h-5" />
        <div className="flex items-end gap-4 h-[260px]">
          {BAR_HEIGHTS.map((height, index) => (
            <Skeleton key={index} className={`flex-1 ${height}`} />
          ))}
        </div>
        <SkeletonLine className="w-64" />
      </Card>
    </LoadingRegion>
  )
}

export function PredictionsSkeleton() {
  return (
    <LoadingRegion className="flex flex-col gap-4">
      <SkeletonLine className="w-40 self-start" />

      <Card className="flex flex-col gap-3.5">
        <SkeletonLine className="w-44 h-5" />
        <SkeletonLine className="w-72" />
        <div className="flex flex-wrap gap-x-16 gap-y-5 mt-1">
          <StatBlock valueClassName="w-40 h-9" />
          <StatBlock valueClassName="w-60 h-9" />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <SkeletonLine className="w-52 h-5" />
        <div className="flex items-end gap-4 h-[260px]">
          {[...BAR_HEIGHTS, 'h-[70%]'].map((height, index) => (
            <Skeleton key={index} className={`flex-1 ${height}`} />
          ))}
        </div>
        <SkeletonLine className="w-64" />
      </Card>
    </LoadingRegion>
  )
}

export function TransactionsSkeleton() {
  return (
    <LoadingRegion className="flex flex-col gap-4 h-full">
      <SkeletonLine className="w-40 self-start" />

      <div className="flex items-end gap-x-11 gap-y-5 flex-wrap px-1 pb-[18px] border-b border-rule">
        <StatBlock valueClassName="w-44 h-10" />
        <StatBlock valueClassName="w-36 h-10" />
        <div className="w-full lg:w-auto lg:ml-auto flex flex-wrap gap-x-8 gap-y-4 sm:gap-x-[34px]">
          <StatBlock valueClassName="w-28 h-7" />
          <StatBlock valueClassName="w-28 h-7" />
          <StatBlock valueClassName="w-28 h-7" />
        </div>
      </div>

      <Card className="flex-1 min-h-0 flex flex-col gap-3.5">
        <div className="flex items-center gap-3.5 flex-wrap">
          <SkeletonLine className="w-52 h-5" />
          <div className="flex gap-2">
            <Skeleton radius="rounded-full" className="w-16 h-9" />
            <Skeleton radius="rounded-full" className="w-20 h-9" />
            <Skeleton radius="rounded-full" className="w-20 h-9" />
          </div>
          <Skeleton radius="rounded-full" className="w-36 h-9 ml-auto" />
        </div>
        <SkeletonLine className="w-48" />
        <TableSkeleton rows={9} columns={5} />
      </Card>
    </LoadingRegion>
  )
}

export function AdminSkeleton() {
  return (
    <LoadingRegion className="flex flex-col gap-4 h-full">
      <SkeletonLine className="w-40 self-start" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {times(4).map((index) => (
          <Card key={index}>
            <StatBlock valueClassName="w-28 h-7" />
          </Card>
        ))}
      </div>

      <Card className="flex flex-col gap-3.5 flex-1 min-h-0">
        <SkeletonLine className="w-24 h-5" />
        <TableSkeleton rows={7} columns={5} />
      </Card>
    </LoadingRegion>
  )
}
