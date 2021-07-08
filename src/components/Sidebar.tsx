import { useMemo } from 'react'
import { useQuery } from 'react-query'
import ContentLoader from 'react-content-loader'
import { usePlausible } from 'next-plausible'

import { styled, CSS } from 'lib/style'
import { useFilters } from 'lib/filters'

import { Box, Text, Button, RadioFilter, Select, CheckboxFilter } from './UI'

const Holder = styled('aside', {
  width: '$sidebar',
  height: '$scroll',

  flexShrink: 0,

  backgroundColor: '$panel',
  borderRight: '1px solid $muted',

  position: 'absolute',
  zIndex: '$3',

  transition: 'transform $motion',

  '@md': {
    position: 'relative',
  },
})

const Inner = styled('div', {
  position: 'absolute',

  width: '100%',
  height: '100%',

  overflowY: 'auto',
  scrollbarWidth: 'thin',
})

type Props = {
  isVisibleMobile: boolean
  onMobileClose: () => void
}
export const Sidebar = ({ isVisibleMobile, onMobileClose }: Props) => {
  return (
    <>
      {isVisibleMobile && (
        <Box
          onClick={() => onMobileClose()}
          css={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',

            zIndex: '$2',
            '@md': {
              display: 'none',
            },
          }}
        />
      )}
      <Holder
        css={{
          transform: `translateX(${isVisibleMobile ? '0' : '-100%'})`,

          '@md': {
            transform: 'none',
          },
        }}
      >
        <Inner>
          <MobileSort />
          <Genre />
          <National />
          <Year />
          <Channels />
        </Inner>
      </Holder>
    </>
  )
}

/**
 * Sort (Mobile Only)
 */

const MobileSort = () => {
  const plausible = usePlausible()
  const { state, dispatch } = useFilters()

  return (
    <FilterSection
      title="Sort"
      css={{
        '@md': { display: 'none' },
      }}
    >
      <Select
        variant="small"
        css={{ color: '$foreground' }}
        value={state.sort}
        onChange={(e) => {
          plausible('sort', {
            props: {
              value: e.currentTarget.value,
            },
          })
          dispatch({
            type: 'SET_SORT',
            payload: e.currentTarget.value as 'imdb' | 'rotten',
          })
        }}
      >
        <option value="imdb">IMDB</option>
        <option value="rotten">Rotten Tomatoes</option>
      </Select>
    </FilterSection>
  )
}

/**
 * Genres
 */

const genres = [
  { label: 'Action', value: 'Action' },
  { label: 'Adventure', value: 'Adventure' },
  { label: 'Comedy', value: 'Comedy' },
  { label: 'Crime', value: 'Crime' },
  { label: 'Documentary', value: 'Documentary' },
  { label: 'Drama', value: 'Drama' },
  { label: 'History', value: 'History' },
  { label: 'Horror', value: 'Horror' },
  { label: 'Musical', value: 'Musical' },
  { label: 'Romance', value: 'Romance' },
  { label: 'Sci-Fi', value: 'Sci-Fi' },
  { label: 'Sport', value: 'Sport' },
  { label: 'Thriller', value: 'Thriller' },
  { label: 'War', value: 'War' },
  { label: 'Western', value: 'Western' },
]

const Genre = () => {
  const plausible = usePlausible()
  const { dispatch, state } = useFilters()

  return (
    <FilterSection title="Genre">
      <RadioFilter
        name="genre"
        value="any"
        label="Any genre"
        checked={!state.genre}
        onChange={() => {
          plausible('genre', { props: { genre: null } })
          dispatch({ type: 'SET_GENRE', payload: null })
        }}
      />
      {genres.map((genre) => (
        <RadioFilter
          key={genre.value}
          name="genre"
          value={genre.value}
          label={genre.label}
          checked={state.genre === genre.value}
          onChange={() => {
            plausible('genre', { props: { genre: genre.value } })
            dispatch({ type: 'SET_GENRE', payload: genre.value })
          }}
        />
      ))}
    </FilterSection>
  )
}

/**
 * National
 */
const National = () => {
  const plausible = usePlausible()
  const { dispatch, state } = useFilters()

  return (
    <FilterSection title="Country">
      <CheckboxFilter
        checked={state.nationalOnly}
        onChange={(e) => {
          plausible('national', {
            props: { onlyNational: e.currentTarget.checked },
          })
          dispatch({ type: 'TOGGLE_NATIONAL' })
        }}
        label="Portuguese movies"
      />
    </FilterSection>
  )
}
/**
 * Years
 */
const years = [
  { label: '2020s', value: '2020' },
  { label: '2010s', value: '2010' },
  { label: '2000s', value: '2000' },
  { label: '1990s', value: '1990' },
  { label: '1980s', value: '1980' },
  { label: '1970s', value: '1970' },
  { label: '1960s', value: '1960' },
  { label: '1950s', value: '1950' },
  { label: '1940s', value: '1940' },
  { label: '1930s', value: '1930' },
  { label: '1920s', value: '1920' },
]

const Year = () => {
  const plausible = usePlausible()
  const { dispatch, state } = useFilters()

  return (
    <FilterSection title="Year">
      <Select
        value={!state.year ? 'any' : state.year}
        onChange={(e) => {
          plausible('year', { props: { year: e.currentTarget.value } })
          dispatch({ type: 'SET_YEAR', payload: e.currentTarget.value })
        }}
      >
        <option value="any">Any year</option>
        {years.map((year) => (
          <option key={year.value} value={year.value}>
            {year.label}
          </option>
        ))}
      </Select>
    </FilterSection>
  )
}

/**
 * Channels
 */
const Channels = () => {
  const plausible = usePlausible()
  const { state, dispatch } = useFilters()
  const { data, isLoading } = useQuery<{
    channels: {
      id: number
      is_premium: boolean
      name: string
    }[]
  }>('channels', async () => {
    const res = await fetch('/api/channels')

    if (!res.ok) throw new Error('Could not fetch channels')

    return res.json()
  })

  const premium = useMemo(() => {
    return data?.channels.filter((c) => c.is_premium) || []
  }, [data])
  const channels = useMemo(() => {
    return data?.channels.filter((c) => !c.is_premium) || []
  }, [data])

  if (isLoading) {
    return (
      <FilterSection title="Channels">
        <ContentLoader
          uniqueKey="channelsLoader"
          width={200}
          height={75}
          backgroundColor="hsla(220, 10%, 50%, 0.1)"
          foregroundColor="hsla(220, 10%, 50%, 0.05)"
        >
          <rect x="8" y="10" width="200" height="15" />
          <rect x="8" y="35" width="170" height="15" />
          <rect x="8" y="60" width="180" height="15" />
        </ContentLoader>
      </FilterSection>
    )
  }

  return (
    <>
      {premium.length > 0 && (
        <FilterSection
          title="Premium Channels"
          button={{
            label: state.premium.length < premium.length ? 'None' : 'All',
            onClick: () => {
              plausible('all premium', {
                props: {
                  value: state.premium.length < premium.length ? 'None' : 'All',
                },
              })
              dispatch({
                type: 'SET_PREMIUM',
                payload:
                  state.premium.length < premium.length
                    ? premium.map((c) => c.id)
                    : [],
              })
            },
          }}
        >
          {premium.map((channel) => (
            <CheckboxFilter
              key={channel.id}
              checked={!state.premium.includes(channel.id)}
              onChange={(e) => {
                plausible('premium channel', {
                  props: {
                    channel: channel.id,
                    channelName: channel.name,
                    checked: e.currentTarget.checked,
                  },
                })
                dispatch({ type: 'TOGGLE_PREMIUM', payload: channel.id })
              }}
              label={channel.name}
            />
          ))}
        </FilterSection>
      )}
      {channels.length > 0 && (
        <FilterSection
          title="Channels"
          button={{
            label: state.channels.length < channels.length ? 'None' : 'All',
            onClick: () => {
              plausible('all channels', {
                props: {
                  value:
                    state.channels.length < channels.length ? 'None' : 'All',
                },
              })
              dispatch({
                type: 'SET_CHANNELS',
                payload:
                  state.channels.length < channels.length
                    ? channels.map((c) => c.id)
                    : [],
              })
            },
          }}
        >
          {channels.map((channel) => (
            <CheckboxFilter
              key={channel.id}
              label={channel.name}
              checked={!state.channels.includes(channel.id)}
              onChange={(e) => {
                plausible('channel', {
                  props: {
                    channel: channel.id,
                    channelName: channel.name,
                    checked: e.currentTarget.checked,
                  },
                })
                dispatch({ type: 'TOGGLE_CHANNEL', payload: channel.id })
              }}
            />
          ))}
        </FilterSection>
      )}
    </>
  )
}

type FilterSectionProps = {
  title: string
  button?: {
    label: string
    onClick: () => void
  }
  css?: CSS
}

const FilterSectionHolder = styled('div', {
  pt: '$16',
  pb: '$8',
  px: '$8',
})
const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  button,
  children,
  css,
}) => {
  return (
    <FilterSectionHolder css={css}>
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',

          pb: '$8',
          px: '$8',
        }}
      >
        <Text variant="caps" css={{ color: '$secondary' }}>
          {title}
        </Text>
        {button && (
          <Button size="sm" onClick={button.onClick}>
            {button.label}
          </Button>
        )}
      </Box>
      {children}
    </FilterSectionHolder>
  )
}
