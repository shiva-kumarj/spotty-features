import React from 'react'
import Config from '../public/config.json'

export default class Auth extends React.Component {
  render() {
    const host = 'https://accounts.spotify.com'
    const redirectUri = `${window.location.protocol}//${window.location.host}/auth`
    const scopes = 'user-library-read'
    const authUrl = `${host}/authorize?response_type=token` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&client_id=${Config.spotify.clientId}` +
      `&scope=${encodeURIComponent(scopes)}`
    return (
      <a href={authUrl}>Sign into Spotify</a>
    )
  }
}
