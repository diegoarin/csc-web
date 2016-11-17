class UserSession < Authlogic::Session::Base
  logout_on_timeout true
  remember_me_for 2.weeks
end
