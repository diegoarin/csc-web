class Notifier < ApplicationMailer

  def password_reset_instructions(user)
    @user = user
    #Sacar URL de conf
    @url  = "http://localhost:3000/#/restart/#{@user.perishable_token}"
    mail(to: @user.email, from:'carrauInfo@gmail.com', subject: 'Restablecer contraseña', sent_on: Time.now) do |format|
      #FIXME: pq tuve que crear el 'password_reset_instructions' dentro de la carpeta 'layouts'
      #y 'notifier' para que funcione?
      format.html { render layout: 'password_reset_instructions' }
    end
  end

end
