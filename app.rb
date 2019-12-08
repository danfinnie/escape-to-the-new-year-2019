require 'sinatra'
require 'sinatra/activerecord'

class App < Sinatra::Base
  get "/" do
    erb :index
  end

  get "/env" do
    erb :env, locals: {
	  host: ENV['DATABASE_HOST'],
	  database: ENV['DATABASE_NAME'],
	  username: ENV['DATABASE_USER'],
	  password: ENV['DATABASE_PASSWORD']
     }
  end
end
