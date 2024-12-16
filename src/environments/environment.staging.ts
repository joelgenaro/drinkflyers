export const environment = {
    production: false
}

export const apis = {
    baseUrl: 'https://staging-api.starfulfil.co.uk/api',
    googleApiKey: '',
    googleCaptchaSiteKey: '',
    artworkUrl: 'https://artwork.letsprintondemand.com/api'
}

export const socialLoginUrls = {
    google: `${apis.baseUrl}/public/login/google`,
    facebook: `${apis.baseUrl}/public/login/facebook`
}

export const appURL = 'https://staging.starfulfil.co.uk/'