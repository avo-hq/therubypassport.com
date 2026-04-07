Rails.application.routes.draw do
  resource :session
  resources :passwords, param: :token

  scope "(:locale)", locale: /ja/ do
    root "home#index"
    get "organizer", to: "home#organizer", as: :organizer
    get "organizer/checklist", to: "home#organizer_checklist", as: :organizer_checklist
    get "stamp-samples", to: "home#stamp_samples", as: :stamp_samples
    get "embassy-instructions", to: "home#embassy_instructions", as: :embassy_instructions
  end

  mount_avo
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
