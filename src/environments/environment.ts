export const environment = {
    production: false
}

export const apis = {
    baseUrl: 'https://development-api.starfulfil.co.uk/api',
    // baseUrl: 'http://localhost:8000/api',
    googleApiKey: '',
    googleCaptchaSiteKey: '',
    artworkUrl: 'https://artwork.letsprintondemand.com/api'
}

export const socialLoginUrls = {
    google: `${apis.baseUrl}/public/login/google`,
    facebook: `${apis.baseUrl}/public/login/facebook`
}

export const appURL = 'https://development.starfulfil.co.uk'
// export const appURL = 'http://localhost:4600'

