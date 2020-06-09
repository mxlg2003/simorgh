import config from '../../support/config/services';
import envConfig from '../../support/config/envs';
import appConfig from '../../../src/server/utilities/serviceConfigs';
import describeForEuOnly from '../../support/helpers/describeForEuOnly';
import getBrandedImage from '../../support/helpers/getBrandedImage';

// For testing important features that differ between services, e.g. Timestamps.
// We recommend using inline conditional logic to limit tests to services which differ.
export const testsThatAlwaysRunForAllPages = ({ service, pageType }) => {
  describe(`No testsToAlwaysRunForAllPages to run for ${service} ${pageType}`, () => {});
};

// For testing features that may differ across services but share a common logic e.g. translated strings.
export const testsThatFollowSmokeTestConfigforAllPages = ({
  service,
  pageType,
  variant,
}) => {
  describe(`Running testsForAllPages for ${service} ${pageType}`, () => {
    describe(`Metadata`, () => {
      if (pageType !== 'errorPage404' && pageType !== 'mostReadPage') {
        it('should have the correct shared metadata', () => {
          cy.request(`${Cypress.env('currentPath')}.json`).then(({ body }) => {
            const mediaAssetPageType = 'mediaAssetPage';
            const articlesPageType = 'articles';
            const photoGalleryPageType = 'photoGalleryPage';
            const storyPageType = 'storyPage';

            const cpsPageTypes = [
              mediaAssetPageType,
              photoGalleryPageType,
              storyPageType,
            ];

            const { indexImage } = body.promo;
            const imagePath = indexImage ? indexImage.path : null;

            const imageAltText =
              indexImage &&
              cpsPageTypes.includes(pageType) &&
              indexImage.altText
                ? indexImage.altText
                : appConfig[config[service].name][variant].defaultImageAltText;

            const imageSrc =
              imagePath && cpsPageTypes.includes(pageType)
                ? getBrandedImage({
                    imagePath,
                    serviceName: config[service].name,
                  })
                : appConfig[config[service].name][variant].defaultImage;

            const ogType = [
              articlesPageType,
              mediaAssetPageType,
              photoGalleryPageType,
              storyPageType,
            ].includes(pageType)
              ? 'article'
              : 'website';

            cy.get('head').within(() => {
              cy.get('meta[property="fb:admins"]').should(
                'have.attr',
                'content',
                '100004154058350',
              );
              cy.get('meta[property="fb:app_id"]').should(
                'have.attr',
                'content',
                '1609039196070050',
              );
              cy.get('meta[property="og:image"]').should(
                'have.attr',
                'content',
                imageSrc,
              );
              cy.get('meta[property="og:image:alt"]').should(
                'have.attr',
                'content',
                imageAltText,
              );
              cy.get('meta[property="og:locale"]').should(
                'have.attr',
                'content',
                appConfig[config[service].name][variant].locale,
              );
              cy.get('meta[property="og:type"]').should(
                'have.attr',
                'content',
                ogType,
              );
              cy.get('meta[property="og:url"]').should(
                'have.attr',
                'content',
                `${envConfig.baseUrl}${Cypress.env('currentPath')}`,
              );
              cy.get('meta[property="og:site_name"]').should(
                'have.attr',
                'content',
                appConfig[config[service].name][variant].brandName,
              );
              cy.get('meta[name="twitter:card"]').should(
                'have.attr',
                'content',
                'summary_large_image',
              );
              cy.get('meta[name="twitter:creator"]').should(
                'have.attr',
                'content',
                appConfig[config[service].name][variant].twitterCreator,
              );
              cy.get('meta[name="twitter:image:alt"]').should(
                'have.attr',
                'content',
                imageAltText,
              );
              cy.get('meta[name="twitter:image:src"]').should(
                'have.attr',
                'content',
                imageSrc,
              );
              cy.get('meta[name="twitter:site"]').should(
                'have.attr',
                'content',
                appConfig[config[service].name][variant].twitterSite,
              );
              cy.get('link[rel="apple-touch-icon"]').each(link => {
                const url = link.attr('href');
                cy.request({
                  url,
                  failOnStatusCode: false,
                }).then(resp => {
                  expect(resp.status).to.equal(200);
                });
              });
            });
          });
        });
      }
    });

    describeForEuOnly('Consent Banners', () => {
      it('have correct translations', () => {
        cy.contains(
          appConfig[config[service].name][variant].translations.consentBanner
            .privacy.title,
        );
        cy.contains(
          appConfig[config[service].name][variant].translations.consentBanner
            .privacy.reject,
        );
        cy.contains(
          appConfig[config[service].name][variant].translations.consentBanner
            .privacy.accept,
        ).click();
        cy.contains(
          appConfig[config[service].name][variant].translations.consentBanner
            .cookie.title,
        );
        cy.contains(
          appConfig[config[service].name][variant].translations.consentBanner
            .cookie.reject,
        );
        cy.contains(
          appConfig[config[service].name][variant].translations.consentBanner
            .cookie.accept,
        );
      });
    });

    describe('Header Tests', () => {
      const serviceName = config[service].name;
      // limit number of tests to 2 services for navigation toggling
      const testMobileNav =
        serviceName === 'ukchina' || serviceName === 'persian';

      if (testMobileNav) {
        it('should show dropdown menu and hide scrollable menu when menu button is clicked', () => {
          cy.viewport(320, 480);
          cy.get('nav')
            .find('div[class^="StyledScrollableNav"]')
            .should('be.visible');

          cy.get('nav')
            .find('ul[class^="DropdownUl"]')
            .should('not.be.visible');

          cy.get('nav button').click();

          cy.get('nav')
            .find('div[class^="StyledScrollableNav"]')
            .should('not.be.visible');

          cy.get('nav').find('ul[class^="DropdownUl"]').should('be.visible');
        });
      }
    });

    describe('Footer Tests', () => {
      describe('footer tests', () => {
        it('should have a visible footer', () => {
          cy.get('footer')
            .should('have.length', 1)
            .should('have.attr', 'role', 'contentinfo')
            .find('a')
            .should('have.attr', 'href', `/${config[service].name}`)
            .find('svg')
            .should('be.visible');
        });
      });

      it('should render the BBC branding', () => {
        cy.get('footer a')
          .eq(0)
          .should(
            'contain',
            appConfig[config[service].name][variant].serviceLocalizedName !==
              undefined
              ? `${appConfig[config[service].name][variant].product}, ${
                  appConfig[config[service].name][variant].serviceLocalizedName
                }`
              : appConfig[config[service].name][variant].product,
          );
      });
    });
    if (
      ['mediaAssetPage', 'photoGalleryPage', 'storyPage'].includes(pageType)
    ) {
      describe('Photo Gallery, Story Page and MAP Tests', () => {
        it('should render a timestamp', () => {
          cy.request(`${Cypress.env('currentPath')}.json`).then(({ body }) => {
            if (body.metadata.options.allowDateStamp) {
              cy.get('time')
                .eq(0)
                .should('be.visible')
                .should('have.attr', 'datetime')
                .should('not.be.empty');
            } else {
              cy.log('Test skipped - allowDateStamp false within metadata');
            }
          });
        });
        if (['photoGalleryPage', 'storyPage'].includes(pageType)) {
          it('should render a H1, which displays the headline', () => {
            cy.request(`${Cypress.env('currentPath')}.json`).then(
              ({ body }) => {
                cy.get('h1').should('contain', body.promo.headlines.headline);
              },
            );
          });
        }
      });
    }
    // End of block (['mediaAssetPage', 'photoGalleryPage', 'storyPage'].includes(pageType))
  });
};

// For testing low priority things e.g. cosmetic differences, and a safe place to put slow tests.
export const testsThatNeverRunDuringSmokeTestingForAllPageTypes = ({
  service,
  pageType,
}) => {
  describe(`Running testsToNeverSmokeTestForAllPageTypes for ${service} ${pageType}`, () => {});
};
