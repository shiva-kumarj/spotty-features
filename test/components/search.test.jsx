import fetchMock from 'fetch-mock'
import React from 'react'
import renderer from 'react-test-renderer'
import { shallow, mount } from 'enzyme'

import Config from '../../src/public/config'
import Search from '../../src/components/search.jsx'

import AudioFeaturesResponse from '../fixtures/spotify/audio-features'
import TrackSearchResponse from '../fixtures/spotify/track-search'

import waitForRequests from '../helpers/wait-for-requests'

function props(unauthorized) {
  return {
    token: '123abc',
    unauthorized
  }
}

describe('Search', () => {
  let component = null
  let wasUnauthorized = false

  const unauthorized = () => {
    wasUnauthorized = true
  }

  beforeEach(() => {
    component = <Search {...props(unauthorized)} />
  })

  afterEach(fetchMock.restore)

  test('matches snapshot', () => {
    const tree = renderer.create(component).toJSON()
    expect(tree).toMatchSnapshot()
  })

  test('can search for tracks and choose one as a seed', done => {
    const path1 = 'search?q=scream%20grimes&type=track&limit=20&offset=0'
    const searchReq = fetchMock.get(`${Config.spotify.apiUrl}/${path1}`,
                                    TrackSearchResponse)

    const trackID = '6cgvDYk7YGQTVfd5jsw0Qw'
    const path2 = `audio-features/${trackID}`
    const featureReq = fetchMock.get(`${Config.spotify.apiUrl}/${path2}`,
                                     AudioFeaturesResponse)

    const wrapper = mount(component)

    // No search results, chosen seed track, or audio features header yet
    expect(wrapper.find('.results').children().length).toBe(0)
    expect(wrapper.find('.seed-summary').length).toBe(0)
    expect(wrapper.find('.refine-title').length).toBe(0)

    // Enter a track search query
    const input = wrapper.find('#seed')
    input.simulate('change', { target: { value: 'scream grimes' } })

    // Submit the search form
    const form = wrapper.find('form')
    form.simulate('submit', { preventDefault() {} })

    waitForRequests([searchReq], null, () => {
      // Still no audio features header
      expect(wrapper.find('.refine-title').length).toBe(0)

      // Should see track search result
      const children = wrapper.find('.results').children()
      expect(children.length).toBe(1)
      expect(children.at(0).name()).toBe('SearchResultTrack')

      // Choose the search result as our seed track
      const button = wrapper.find('.results .search-result-button')
      expect(button.length).toBe(1)
      button.simulate('click')

      waitForRequests([featureReq], done, () => {
        // Now should see the track seed summary and audio features header
        expect(wrapper.find('.seed-summary').length).toBe(1)
        expect(wrapper.find('.refine-title').length).toBe(1)
      })
    })
  })
})
